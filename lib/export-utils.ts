/**
 * Export Utilities
 * 
 * Client-side file generation for Excel and PDF exports
 */

import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Generate and download Excel file
 */
export function downloadExcel(
  data: any[],
  columns: Array<{ id: string; label: string }>,
  filename: string
) {
  // Filter columns and prepare data
  const headers = columns.map(col => col.label)
  const rows = data.map(item => 
    columns.map(col => {
      const value = item[col.id]
      // Handle null/undefined
      if (value === null || value === undefined) return ''
      // Handle dates
      if (value instanceof Date) return value.toLocaleDateString()
      // Handle objects
      if (typeof value === 'object') return JSON.stringify(value)
      return value
    })
  )

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  
  // Set column widths
  const colWidths = columns.map(() => ({ wch: 20 }))
  ws['!cols'] = colWidths

  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

  // Download file
  XLSX.writeFile(wb, filename)
}

/**
 * Generate and download PDF file
 */
export function downloadPDF(
  data: any[],
  columns: Array<{ id: string; label: string }>,
  filename: string,
  title?: string
) {
  const doc = new jsPDF()

  // Add title if provided
  if (title) {
    doc.setFontSize(16)
    doc.text(title, 14, 15)
  }

  // Prepare table data
  const headers = columns.map(col => col.label)
  const rows = data.map(item => 
    columns.map(col => {
      const value = item[col.id]
      if (value === null || value === undefined) return ''
      if (value instanceof Date) return value.toLocaleDateString()
      if (typeof value === 'object') return JSON.stringify(value)
      return String(value)
    })
  )

  // Generate table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: title ? 25 : 10,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  })

  // Download file
  doc.save(filename)
}

