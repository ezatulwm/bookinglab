import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Shield, Download, Check, X, Clock, Calendar, User, GraduationCap, LogOut } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface AdminPanelProps {
  bookings: any[]
  onApproveBooking: (id: string, status: 'pending' | 'approved' | 'rejected') => Promise<void>
  onExportReport: (displayedBookings: any[]) => Promise<void>
  onLogout: () => void
}

export default function AdminPanel({ bookings, onApproveBooking, onExportReport, onLogout }: AdminPanelProps) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  // --- FILTER STATE ---
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTeacher, setSelectedTeacher] = useState<string>("")
  const [selectedClass, setSelectedClass] = useState<string>("")

  // Unique dropdown options
  const teacherOptions = useMemo(() => Array.from(new Set(bookings.map(b => b.name))), [bookings]);
  const classOptions = useMemo(() => Array.from(new Set(bookings.map(b => b.class))), [bookings]);

  // --- FILTER & SORT LOGIC ---
  const displayBookings = useMemo(() => {
    let filtered = bookings;

    if (selectedDate) {
      filtered = filtered.filter(b => {
        const d = new Date(b.date);
        return d.toISOString().slice(0,10) === selectedDate;
      });
    }
    if (selectedTeacher) {
      filtered = filtered.filter(b => b.name === selectedTeacher);
    }
    if (selectedClass) {
      filtered = filtered.filter(b => b.class === selectedClass);
    }

    // --- Special Sort ---
    // 1. Pending bookings: sort by submission time (created_at, newest first)
    // 2. Others: sort by booking date (newest first)
    const pending = filtered.filter(b => b.status === 'pending')
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).reverse();

    const others = filtered.filter(b => b.status !== 'pending')
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return [...pending, ...others];
  }, [bookings, selectedDate, selectedTeacher, selectedClass]);

  const handleStatusChange = async (
    id: string,
    status: 'pending' | 'approved' | 'rejected'
  ) => {
    setProcessingIds(prev => new Set(prev).add(id))
    try {
      await onApproveBooking(id, status)
      toast({
        title: "Status Updated",
        description: `Booking ${status} successfully.`,
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating the booking status.",
        variant: "destructive",
      })
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  // Export ONLY what's visible (filters + sort applied)
  const handleExport = async () => {
    try {
      await onExportReport(displayBookings)
      toast({
        title: "Report Exported",
        description: "The booking report has been downloaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the report.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200'
    }
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50/30">
      <CardHeader className="space-y-1 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-600" />
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Admin Panel
              </CardTitle>
              <p className="text-gray-600">Manage booking requests and generate reports</p>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-900"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </CardHeader>
      <CardContent>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
            <div className="text-sm text-blue-600">Total Bookings</div>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="text-2xl font-bold text-amber-700">{stats.pending}</div>
            <div className="text-sm text-amber-600">Pending</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
            <div className="text-sm text-green-600">Approved</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
            <div className="text-sm text-red-600">Rejected</div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end mb-4">
          <Button 
            onClick={handleExport}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* --- FILTER CONTROLS --- */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Teacher</label>
            <select
              className="border rounded px-2 py-1"
              value={selectedTeacher}
              onChange={e => setSelectedTeacher(e.target.value)}
            >
              <option value="">All</option>
              {teacherOptions.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Class</label>
            <select
              className="border rounded px-2 py-1"
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
            >
              <option value="">All</option>
              {classOptions.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
          
          {displayBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No bookings found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold text-gray-900">{booking.name}</span>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid gap-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          <span>{booking.class}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(booking.date), 'PPP')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{booking.times.map((t: number) => `${t}:00`).join(', ')}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Submitted: {format(new Date(booking.created_at), 'PPp')}
                        </div>
                      </div>
                    </div>
                    
                    {booking.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleStatusChange(booking.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                          disabled={processingIds.has(booking.id)}
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(booking.id, 'rejected')}
                          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1"
                          disabled={processingIds.has(booking.id)}
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
