import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'

// Define your BookingData interface
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
  const doc = new jsPDF()

  // Title
  doc.setFontSize(18)
  doc.text('Teacher Booking Report', 14, 22)

  // Metadata
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(`Generated: ${format(new Date(), 'PPP')}`, 14, 30)
  doc.text(
    `Total: ${bookings.length} | Approved: ${bookings.filter(b => b.status === 'approved').length} | Pending: ${bookings.filter(b => b.status === 'pending').length} | Rejected: ${bookings.filter(b => b.status === 'rejected').length}`,
    14,
    36
  )

  // Convert data
  const tableBody = bookings.map(b => [
    b.name,
    b.class,
    format(new Date(b.date), 'PP'),
    b.times.split(',').map(t => `${t}:00`).join(', '),
    b.status.toUpperCase(),
    format(new Date(b.created_at), 'PP'),
  ])

  // AutoTable for formatted output
  doc.autoTable({
    head: [['Teacher Name', 'Class', 'Date', 'Time Slots', 'Status', 'Submitted']],
    body: tableBody,
    startY: 44,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246], // Tailwind blue-600
      textColor: 255,
      halign: 'center',
    },
  })

  // Save PDF
  doc.save(`booking-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
}
