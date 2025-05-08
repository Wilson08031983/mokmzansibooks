# MokMzansi Books - Clients Module

## Overview

The Clients module provides comprehensive client management capabilities for MokMzansi Books, supporting different client types:
- Companies
- Individuals
- Vendors

## Features

- **Client Management**: Create, read, update, and delete clients
- **Credit Management**: Add and manage client credit
- **Filtering**: Filter clients by type and search criteria
- **Last Interaction Tracking**: Track when a client was last interacted with

## Architecture

The Clients module follows a layered architecture:

1. **UI Layer**: React components in `src/pages/Clients.tsx`
2. **State Management**: LocalStorage persistence with future Supabase integration
3. **Service Layer**: Supabase client services in `src/services/supabase/clientService.ts`
4. **Global Context**: Client context provider in `src/contexts/ClientContext.tsx`

## Data Flow

1. User interacts with the Clients page UI
2. Actions trigger state updates in the component
3. State changes persist to LocalStorage
4. Future implementation: Data syncs with Supabase backend

## Integration Points

- **ClientContext**: Provides client data and operations to other components
- **Supabase Client Service**: Handles client data operations with the backend
- **NotificationsContext**: Displays notifications for client operations

## Production Implementation Plan

1. **Initial Deployment**: Current client page with LocalStorage persistence
2. **Supabase Integration**: Migrate to Supabase backend using provided service layer
3. **Error Handling**: Implement additional error handling and validation
4. **Sample Data Removal**: Replace mock data with production data

## Usage

To use the Clients module in other components:

```tsx
import { useClients } from '@/contexts/ClientContext';

const MyComponent = () => {
  const { clients, addClient, updateClient, deleteClient } = useClients();
  
  // Access client data
  const allCompanies = clients.companies;
  
  // Perform operations
  const handleUpdateClient = (client) => {
    updateClient(client);
  };
  
  return (
    // Component implementation
  );
};
```

## Database Schema (Supabase)

### Companies Table
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  address_line2 TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  credit NUMERIC DEFAULT 0,
  outstanding NUMERIC DEFAULT 0,
  overdue NUMERIC DEFAULT 0,
  last_interaction DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Individuals Table
```sql
CREATE TABLE individuals (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  address_line2 TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  credit NUMERIC DEFAULT 0,
  outstanding NUMERIC DEFAULT 0,
  overdue NUMERIC DEFAULT 0,
  last_interaction DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Vendors Table
```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  address_line2 TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  credit NUMERIC DEFAULT 0,
  outstanding NUMERIC DEFAULT 0,
  overdue NUMERIC DEFAULT 0,
  last_interaction DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
