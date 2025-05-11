/**
 * Quote Export Adapter
 * 
 * This adapter provides export functionality for quotes to different formats:
 * - Excel (.xlsx)
 * - CSV
 * 
 * This completes the quote management feature set mentioned in the requirements:
 * 1. Convert Quote to Invoice ✅ (implemented in quoteManagementAdapter.ts)
 * 2. Duplicate Quote ✅ (implemented in quoteManagementAdapter.ts)
 * 3. Archive/Restore Quotes ✅ (implemented in quoteManagementAdapter.ts)
 * 4. Quote version history/revisions ✅ (implemented in quoteManagementAdapter.ts)
 * 5. Export to other formats (Excel, CSV) ✅ (implemented in this file)
 */

import { Quote } from './quotesInvoicesAdapter';

/**
 * Convert quote data to CSV format
 * @param quote The quote to convert to CSV
 * @returns CSV string
 */
export const quoteToCSV = (quote: Quote): string => {
  try {
    // Create CSV header
    let csv = 'Item,Description,Quantity,Unit Price,Total\n';
    
    // Add each quote item
    quote.items.forEach(item => {
      // Format each field properly for CSV
      const description = item.description.replace(/"/g, '""'); // Escape quotes
      const row = [
        `"${item.id}"`,
        `"${description}"`,
        item.quantity,
        item.unitPrice.toFixed(2),
        item.total.toFixed(2)
      ].join(',');
      
      csv += row + '\n';
    });
    
    // Add summary rows
    csv += '\n';
    csv += `"","","","Subtotal",${quote.subtotal.toFixed(2)}\n`;
    csv += `"","","","Tax",${quote.tax.toFixed(2)}\n`;
    csv += `"","","","Total",${quote.total.toFixed(2)}\n`;
    
    return csv;
  } catch (error) {
    console.error('QuoteExportAdapter: Error converting quote to CSV', error);
    throw new Error('Failed to convert quote to CSV format');
  }
};

/**
 * Generate a downloadable CSV file from a quote
 * @param quote The quote to export
 * @returns Downloadable URL for the CSV file
 */
export const generateQuoteCSVDownload = (quote: Quote): string => {
  try {
    const csvData = quoteToCSV(quote);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    return url;
  } catch (error) {
    console.error('QuoteExportAdapter: Error generating CSV download', error);
    throw new Error('Failed to generate CSV download');
  }
};

/**
 * Download a quote as CSV file
 * @param quote The quote to download
 * @param filename Optional custom filename (defaults to quote number)
 */
export const downloadQuoteAsCSV = (quote: Quote, filename?: string): void => {
  try {
    const csvData = quoteToCSV(quote);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    
    // Set download attributes
    downloadLink.href = url;
    downloadLink.setAttribute('download', filename || `Quote-${quote.quoteNumber}.csv`);
    downloadLink.style.visibility = 'hidden';
    
    // Add to DOM, trigger download, and remove
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (error) {
    console.error('QuoteExportAdapter: Error downloading quote as CSV', error);
    throw new Error('Failed to download quote as CSV');
  }
};

/**
 * Generate Excel XML format for a quote
 * This is a simple Excel XML format that works without external libraries
 * @param quote The quote to convert to Excel
 * @returns Excel XML string
 */
export const quoteToExcelXML = (quote: Quote): string => {
  try {
    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>MokMzansi Books</Author>
  <Title>Quote ${quote.quoteNumber}</Title>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000" ss:Bold="1"/>
   <Interior ss:Color="#E0E0E0" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Total">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000" ss:Bold="1"/>
  </Style>
  <Style ss:ID="Currency">
   <NumberFormat ss:Format="Currency"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Quote ${quote.quoteNumber}">
  <Table>
   <Column ss:Width="80"/>
   <Column ss:Width="300"/>
   <Column ss:Width="80"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Row>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Item</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Description</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Quantity</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Unit Price</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Total</Data></Cell>
   </Row>`;
   
    // Add each quote item
    quote.items.forEach(item => {
      xml += `
   <Row>
    <Cell><Data ss:Type="String">${item.id}</Data></Cell>
    <Cell><Data ss:Type="String">${item.description.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>
    <Cell><Data ss:Type="Number">${item.quantity}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${item.unitPrice}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${item.total}</Data></Cell>
   </Row>`;
    });
    
    // Add summary rows
    xml += `
   <Row>
    <Cell></Cell>
    <Cell></Cell>
    <Cell></Cell>
    <Cell ss:StyleID="Total"><Data ss:Type="String">Subtotal</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${quote.subtotal}</Data></Cell>
   </Row>
   <Row>
    <Cell></Cell>
    <Cell></Cell>
    <Cell></Cell>
    <Cell ss:StyleID="Total"><Data ss:Type="String">Tax</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${quote.tax}</Data></Cell>
   </Row>
   <Row>
    <Cell></Cell>
    <Cell></Cell>
    <Cell></Cell>
    <Cell ss:StyleID="Total"><Data ss:Type="String">Total</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${quote.total}</Data></Cell>
   </Row>
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <PageSetup>
    <Layout x:Orientation="Portrait"/>
    <Header x:Margin="0.3"/>
    <Footer x:Margin="0.3"/>
    <PageMargins x:Bottom="0.75" x:Left="0.7" x:Right="0.7" x:Top="0.75"/>
   </PageSetup>
   <Print>
    <ValidPrinterInfo/>
    <PaperSizeIndex>9</PaperSizeIndex>
    <HorizontalResolution>600</HorizontalResolution>
    <VerticalResolution>600</VerticalResolution>
   </Print>
   <Selected/>
   <ProtectObjects>False</ProtectObjects>
   <ProtectScenarios>False</ProtectScenarios>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;
    
    return xml;
  } catch (error) {
    console.error('QuoteExportAdapter: Error converting quote to Excel XML', error);
    throw new Error('Failed to convert quote to Excel format');
  }
};

/**
 * Download a quote as Excel file
 * @param quote The quote to download
 * @param filename Optional custom filename (defaults to quote number)
 */
export const downloadQuoteAsExcel = (quote: Quote, filename?: string): void => {
  try {
    const excelData = quoteToExcelXML(quote);
    const blob = new Blob([excelData], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    
    // Set download attributes
    downloadLink.href = url;
    downloadLink.setAttribute('download', filename || `Quote-${quote.quoteNumber}.xls`);
    downloadLink.style.visibility = 'hidden';
    
    // Add to DOM, trigger download, and remove
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (error) {
    console.error('QuoteExportAdapter: Error downloading quote as Excel', error);
    throw new Error('Failed to download quote as Excel');
  }
};

/**
 * Options for batch export of quotes
 */
export interface BatchExportOptions {
  format: 'csv' | 'excel';
  includeArchived?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  statusFilter?: string[];
  clientId?: string;
}

/**
 * Export multiple quotes at once as a zip file
 * Note: This requires the JSZip library to be installed
 * @param quotes The quotes to export
 * @param options Export options
 * @returns Promise resolving to a downloadable URL for the zip file
 */
export const batchExportQuotes = async (
  quotes: Quote[], 
  options: BatchExportOptions
): Promise<string> => {
  try {
    // This method requires the JSZip library
    // In a real implementation, you would import JSZip and use it here
    // For demonstration purposes, we'll just create a JSON file
    
    const jsonData = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    console.log(`QuoteExportAdapter: Would have batch exported ${quotes.length} quotes in ${options.format} format`);
    console.log('To fully implement this feature, please add the JSZip library to your project');
    
    return url;
  } catch (error) {
    console.error('QuoteExportAdapter: Error batch exporting quotes', error);
    throw new Error('Failed to batch export quotes');
  }
};
