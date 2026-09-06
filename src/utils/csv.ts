/**
 * Escapes a single CSV field per RFC 4180: wraps the value in double
 * quotes whenever it contains a comma, quote, or newline, doubling any
 * internal quotes. Safe to open in Microsoft Excel or Google Sheets.
 */
function toCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function buildCsv(headers: string[], rows: string[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(toCsvField).join(','))
  // Leading BOM so Excel opens UTF-8 (Indonesian diacritics, etc.) correctly.
  return `﻿${lines.join('\r\n')}`
}

/** Triggers a browser download of `content` as a file named `filename` — no backend involved. */
export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
