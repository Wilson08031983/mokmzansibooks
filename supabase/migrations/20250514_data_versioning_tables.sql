-- Migration for data versioning and history tables
-- This migration adds tables for data version history and conflict tracking

-- 1. Create the data_version_history table to store version history
CREATE TABLE IF NOT EXISTS data_version_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    version INTEGER NOT NULL,
    data JSONB NOT NULL,
    metadata JSONB NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on category and version for faster lookups
CREATE INDEX IF NOT EXISTS idx_version_history_category_version ON data_version_history(category, version);
CREATE INDEX IF NOT EXISTS idx_version_history_timestamp ON data_version_history(timestamp);

-- Add RLS (Row Level Security) policies
ALTER TABLE data_version_history ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own version history
CREATE POLICY "Users can view their own version history" ON data_version_history
    FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert new versions
CREATE POLICY "Users can insert new versions" ON data_version_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Create a table to track data conflicts
CREATE TABLE IF NOT EXISTS data_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    local_version JSONB,
    server_version JSONB,
    resolved BOOLEAN DEFAULT FALSE,
    resolution_strategy TEXT,
    resolution_timestamp TIMESTAMPTZ,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    resolved_by UUID REFERENCES auth.users(id)
);

-- Create index on category for faster lookups
CREATE INDEX IF NOT EXISTS idx_data_conflicts_category ON data_conflicts(category);
CREATE INDEX IF NOT EXISTS idx_data_conflicts_resolved ON data_conflicts(resolved);

-- Add RLS (Row Level Security) policies
ALTER TABLE data_conflicts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own conflicts
CREATE POLICY "Users can view their own conflicts" ON data_conflicts
    FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert new conflicts
CREATE POLICY "Users can insert new conflicts" ON data_conflicts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
-- Allow authenticated users to update conflicts they own
CREATE POLICY "Users can update their own conflicts" ON data_conflicts
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Create a table for offline queue tracking
CREATE TABLE IF NOT EXISTS sync_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation TEXT NOT NULL,
    target_table TEXT NOT NULL,
    data JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    error_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    user_id UUID REFERENCES auth.users(id)
);

-- Create index for faster query by status
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_user ON sync_queue(user_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own sync queue
CREATE POLICY "Users can view their own sync queue" ON sync_queue
    FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert into sync queue
CREATE POLICY "Users can insert into sync queue" ON sync_queue
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
-- Allow authenticated users to update their own sync queue items
CREATE POLICY "Users can update their own sync queue" ON sync_queue
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Create functions for version management
CREATE OR REPLACE FUNCTION create_version_from_app_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into version history when app_data is updated
    INSERT INTO data_version_history (
        category,
        version,
        data,
        metadata,
        user_id
    )
    VALUES (
        NEW.type,
        COALESCE((NEW.data->>'_meta'->>'version')::INTEGER, 1),
        NEW.data,
        json_build_object(
            'timestamp', CURRENT_TIMESTAMP,
            'userId', auth.uid(),
            'changeDescription', 'Data updated via app_data table',
            'version', COALESCE((NEW.data->>'_meta'->>'version')::INTEGER, 1),
            'changedFields', '[]'::JSONB
        ),
        auth.uid()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically create versions when app_data is updated
DROP TRIGGER IF EXISTS trigger_app_data_versioning ON app_data;
CREATE TRIGGER trigger_app_data_versioning
    AFTER INSERT OR UPDATE ON app_data
    FOR EACH ROW
    EXECUTE FUNCTION create_version_from_app_data();

-- 5. Create function to detect conflicts
CREATE OR REPLACE FUNCTION detect_data_conflict()
RETURNS TRIGGER AS $$
DECLARE
    local_timestamp TIMESTAMPTZ;
    server_timestamp TIMESTAMPTZ;
    time_difference INTEGER;
BEGIN
    -- Extract timestamps
    local_timestamp := (NEW.data->>'_meta'->>'timestamp')::TIMESTAMPTZ;
    
    -- Get the latest version from version history
    SELECT (metadata->>'timestamp')::TIMESTAMPTZ INTO server_timestamp
    FROM data_version_history
    WHERE category = NEW.type
    ORDER BY version DESC
    LIMIT 1;
    
    -- If both timestamps exist, calculate difference in minutes
    IF local_timestamp IS NOT NULL AND server_timestamp IS NOT NULL THEN
        time_difference := EXTRACT(EPOCH FROM (local_timestamp - server_timestamp))/60;
        
        -- If the difference is within 5 minutes, check if data is different
        IF ABS(time_difference) < 5 AND NEW.data::TEXT != (
            SELECT data::TEXT
            FROM data_version_history
            WHERE category = NEW.type
            ORDER BY version DESC
            LIMIT 1
        ) THEN
            -- Insert into conflicts table
            INSERT INTO data_conflicts (
                category,
                local_version,
                server_version,
                user_id
            )
            VALUES (
                NEW.type,
                NEW.data,
                (SELECT data FROM data_version_history 
                 WHERE category = NEW.type 
                 ORDER BY version DESC 
                 LIMIT 1),
                auth.uid()
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically detect conflicts
DROP TRIGGER IF EXISTS trigger_detect_conflicts ON app_data;
CREATE TRIGGER trigger_detect_conflicts
    BEFORE INSERT OR UPDATE ON app_data
    FOR EACH ROW
    EXECUTE FUNCTION detect_data_conflict();
