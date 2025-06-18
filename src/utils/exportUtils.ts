import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPDF = (data: any[], filename: string, title: string = 'Report') => {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add timestamp
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);
  
  // Prepare table data
  if (data.length === 0) {
    doc.setFontSize(12);
    doc.text('No data available', 14, 50);
  } else {
    // Get column headers from the first data object
    const headers = Object.keys(data[0]);
    
    // Prepare table rows
    const rows = data.map(item => headers.map(header => item[header] || ''));
    
    // Add table
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 40 },
    });
  }
  
  // Save the PDF
  doc.save(`${filename}.pdf`);
};