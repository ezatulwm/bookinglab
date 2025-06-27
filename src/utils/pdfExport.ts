import { format } from 'date-fns'

export interface BookingData {
  id: string
  name: string
  class: string
  date: string
  times: string
  status: string
  created_at: string
}

export function downloadPdf(bookings: BookingData[]) {
  // Create HTML content for the report
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Booking Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
        th { background-color: #f3f4f6; font-weight: bold; }
        .approved { color: #10b981; font-weight: bold; }
        .pending { color: #f59e0b; font-weight: bold; }
        .rejected { color: #ef4444; font-weight: bold; }
        .summary { background-color: #f9fafb; padding: 15px; margin-bottom: 20px; border-radius: 8px; }
      </style>
    </head>
    <body>
      <h1>Teacher Booking Report</h1>
      <div class="summary">
        <p><strong>Generated:</strong> ${format(new Date(), 'PPP')}</p>
        <p><strong>Total Bookings:</strong> ${bookings.length}</p>
        <p><strong>Approved:</strong> ${bookings.filter(b => b.status === 'approved').length}</p>
        <p><strong>Pending:</strong> ${bookings.filter(b => b.status === 'pending').length}</p>
        <p><strong>Rejected:</strong> ${bookings.filter(b => b.status === 'rejected').length}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Teacher Name</th>
            <th>Class</th>
            <th>Date</th>
            <th>Time Slots</th>
            <th>Status</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          ${bookings.map(booking => `
            <tr>
              <td>${booking.name}</td>
              <td>${booking.class}</td>
              <td>${format(new Date(booking.date), 'PP')}</td>
              <td>${booking.times.split(',').map(t => `${t}:00`).join(', ')}</td>
              <td class="${booking.status}">${booking.status.toUpperCase()}</td>
              <td>${format(new Date(booking.created_at), 'PP')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `

  // Create blob and download
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `booking-report-${format(new Date(), 'yyyy-MM-dd')}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}