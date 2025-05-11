import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  Tooltip,
  CircularProgress,
  Grid
} from '@mui/material';
import { 
  RestoreOutlined, 
  VisibilityOutlined, 
  CompareArrowsOutlined,
  History as HistoryIcon
} from '@mui/icons-material';
import { getQuoteVersions, restoreQuoteVersion } from '../../utils/quoteManagementAdapter';
import { Quote } from '../../utils/quotesInvoicesAdapter';
import { useSyncStatus } from '../../contexts/SyncContext';

// Import formatDate from a utility file (you may need to create this)
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface QuoteVersionHistoryProps {
  quoteId: string;
  currentQuote: Quote;
  onVersionRestored: () => void;
}

const QuoteVersionHistory: React.FC<QuoteVersionHistoryProps> = ({ 
  quoteId, 
  currentQuote, 
  onVersionRestored 
}) => {
  const [versions, setVersions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [compareVersion, setCompareVersion] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSyncing, showSuccess, showError } = useSyncStatus();

  // Load versions when component mounts
  useEffect(() => {
    loadVersions();
  }, [quoteId]);

  // Function to load quote versions
  const loadVersions = async () => {
    try {
      setIsLoading(true);
      showSyncing('Loading quote version history...');
      
      const versionHistory = await getQuoteVersions(quoteId);
      
      // Sort versions by version number in descending order
      const sortedVersions = [...versionHistory].sort((a, b) => 
        b.versionNumber - a.versionNumber
      );
      
      setVersions(sortedVersions);
      showSuccess('Version history loaded');
    } catch (error) {
      console.error('Error loading quote versions:', error);
      setError('Failed to load quote version history');
      showError('Error loading version history');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle opening the view dialog
  const handleViewVersion = (version: any) => {
    setSelectedVersion(version);
    setViewDialogOpen(true);
  };

  // Handle opening the compare dialog
  const handleCompareVersion = (version: any) => {
    setCompareVersion(version);
    setSelectedVersion({ data: currentQuote });
    setCompareDialogOpen(true);
  };

  // Handle opening the restore dialog
  const handleRestorePrompt = (version: any) => {
    setSelectedVersion(version);
    setRestoreDialogOpen(true);
  };

  // Handle restore version
  const handleRestoreVersion = async () => {
    try {
      setIsLoading(true);
      showSyncing('Restoring quote version...');
      
      const success = await restoreQuoteVersion(quoteId, selectedVersion.id);
      
      if (success) {
        showSuccess('Quote version restored successfully');
        setRestoreDialogOpen(false);
        // Notify parent about the restore
        onVersionRestored();
      } else {
        throw new Error('Failed to restore quote version');
      }
    } catch (error) {
      console.error('Error restoring quote version:', error);
      setError('Failed to restore quote version');
      showError('Error restoring quote version');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to highlight differences between two versions
  const highlightDifferences = (current: any, previous: any, field: string) => {
    // Simple string field comparison
    if (typeof current === 'string' || typeof current === 'number') {
      if (current !== previous) {
        return (
          <Box sx={{ backgroundColor: '#E8F4FD', padding: '2px 4px', borderRadius: '2px' }}>
            {current !== undefined ? current : 'N/A'}
          </Box>
        );
      }
      return current !== undefined ? current : 'N/A';
    }
    
    // Handle items array
    if (field === 'items' && Array.isArray(current) && Array.isArray(previous)) {
      return (
        <Box>
          <Typography variant="caption">
            {current.length} items 
            {current.length !== previous.length ? 
              ` (Changed from ${previous.length} items)` : ''}
          </Typography>
          {current.length !== previous.length && (
            <Box sx={{ backgroundColor: '#E8F4FD', padding: '2px 4px', borderRadius: '2px', mt: 1 }}>
              {current.length > previous.length ? 'Items added' : 'Items removed'}
            </Box>
          )}
        </Box>
      );
    }
    
    // Handle other objects
    return JSON.stringify(current);
  };

  // If still loading, show loading state
  if (isLoading && versions.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress size={32} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading version history...
        </Typography>
      </Box>
    );
  }

  // If no versions found, show empty state
  if (versions.length === 0 && !isLoading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No Version History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This quote doesn't have any saved versions yet. 
          Versions are automatically created when you make changes to a quote.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Typography variant="h6" gutterBottom>
        Quote Version History
      </Typography>
      
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Version</TableCell>
              <TableCell>Date Modified</TableCell>
              <TableCell>Changes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {versions.map((version) => (
              <TableRow key={version.id}>
                <TableCell>v{version.versionNumber}</TableCell>
                <TableCell>{formatDate(version.createdAt)}</TableCell>
                <TableCell>
                  {version.notes || 'No description available'}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View this version">
                    <IconButton 
                      size="small" 
                      onClick={() => handleViewVersion(version)}
                    >
                      <VisibilityOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Compare with current">
                    <IconButton 
                      size="small" 
                      onClick={() => handleCompareVersion(version)}
                    >
                      <CompareArrowsOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Restore this version">
                    <IconButton 
                      size="small" 
                      onClick={() => handleRestorePrompt(version)}
                      disabled={isLoading}
                    >
                      <RestoreOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* View Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Quote Version {selectedVersion?.versionNumber}
          <Typography variant="caption" display="block">
            Created on {selectedVersion?.createdAt && formatDate(selectedVersion.createdAt)}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedVersion && (
            <Box>
              <Typography variant="h6">
                Quote #{selectedVersion.data.quoteNumber}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Client: {selectedVersion.data.client?.name || 'Unknown Client'}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Items
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedVersion.data.items.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          {item.unitPrice.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          {item.total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="subtitle1" sx={{ mr: 2 }}>
                  Subtotal: {selectedVersion.data.subtotal.toFixed(2)}
                </Typography>
                <Typography variant="subtitle1" sx={{ mr: 2 }}>
                  Tax: {selectedVersion.data.tax.toFixed(2)}
                </Typography>
                <Typography variant="h6">
                  Total: {selectedVersion.data.total.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button 
            onClick={() => {
              setViewDialogOpen(false);
              handleRestorePrompt(selectedVersion);
            }}
            color="primary"
          >
            Restore This Version
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Compare Dialog */}
      <Dialog 
        open={compareDialogOpen} 
        onClose={() => setCompareDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Compare Versions
        </DialogTitle>
        <DialogContent dividers>
          {selectedVersion && compareVersion && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h6" align="center" gutterBottom>
                    Current Version
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" align="center" gutterBottom>
                    Version {compareVersion.versionNumber}
                  </Typography>
                  <Typography variant="caption" display="block" align="center">
                    {formatDate(compareVersion.createdAt)}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Field</TableCell>
                      <TableCell>Current Version</TableCell>
                      <TableCell>Previous Version</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Quote Number</TableCell>
                      <TableCell>{selectedVersion.data.quoteNumber}</TableCell>
                      <TableCell>{compareVersion.data.quoteNumber}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Client</TableCell>
                      <TableCell>
                        {selectedVersion.data.client?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {compareVersion.data.client?.name || 'Unknown'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell>
                        {highlightDifferences(
                          selectedVersion.data.status,
                          compareVersion.data.status,
                          'status'
                        )}
                      </TableCell>
                      <TableCell>{compareVersion.data.status}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Items</TableCell>
                      <TableCell>
                        {highlightDifferences(
                          selectedVersion.data.items,
                          compareVersion.data.items,
                          'items'
                        )}
                      </TableCell>
                      <TableCell>
                        {compareVersion.data.items.length} items
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Subtotal</TableCell>
                      <TableCell>
                        {highlightDifferences(
                          selectedVersion.data.subtotal,
                          compareVersion.data.subtotal,
                          'subtotal'
                        )}
                      </TableCell>
                      <TableCell>{compareVersion.data.subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Tax</TableCell>
                      <TableCell>
                        {highlightDifferences(
                          selectedVersion.data.tax,
                          compareVersion.data.tax,
                          'tax'
                        )}
                      </TableCell>
                      <TableCell>{compareVersion.data.tax.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total</TableCell>
                      <TableCell>
                        {highlightDifferences(
                          selectedVersion.data.total,
                          compareVersion.data.total,
                          'total'
                        )}
                      </TableCell>
                      <TableCell>{compareVersion.data.total.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Notes</TableCell>
                      <TableCell>
                        {highlightDifferences(
                          selectedVersion.data.notes,
                          compareVersion.data.notes,
                          'notes'
                        )}
                      </TableCell>
                      <TableCell>{compareVersion.data.notes || 'No notes'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareDialogOpen(false)}>Close</Button>
          <Button 
            onClick={() => {
              setCompareDialogOpen(false);
              handleRestorePrompt(compareVersion);
            }}
            color="primary"
          >
            Restore Previous Version
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Restore Confirmation Dialog */}
      <Dialog
        open={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
      >
        <DialogTitle>
          Restore Quote Version
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to restore version {selectedVersion?.versionNumber}
            {selectedVersion?.createdAt ? ` from ${formatDate(selectedVersion.createdAt)}` : ''}?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            This will overwrite the current version of the quote.
            (A backup of the current version will be automatically created)
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setRestoreDialogOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRestoreVersion}
            color="primary"
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Restore'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuoteVersionHistory;
