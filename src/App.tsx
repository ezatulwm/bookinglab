import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { CalendarDays, Search, Shield } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

import BookingForm from '@/components/BookingForm'
import StatusChecker from '@/components/StatusChecker'
import AdminPanel from '@/components/AdminPanel'
import AdminLogin from '@/components/AdminLogin'
import { supabase } from '@/lib/supabaseClient'
import { downloadPdf } from '@/utils/pdfExport'

import './App.css'

// --- TypeScript interfaces --- //

interface Booking {
  id: string
  name: string
  class: string
  date: string
  times: string // Comma-separated string, e.g., "9,10"
  status: 'pending' | 'approved' | 'rejected'
  created_at?: string
  [key: string]: any // For extra columns
}

interface FormState {
  name: string
  class: string
  date: Date
  times: number[]
}

// --- Component --- //

function App() {
  const [activeTab, setActiveTab] = useState<'booking' | 'status' | 'admin'>('booking')
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false)
  const [form, setForm] = useState<FormState>({
    name: '',
    class: '',
    date: new Date(),
    times: [],
  })
  const [bookings, setBookings] = useState<Booking[]>([])
  const [statusList, setStatusList] = useState<Booking[]>([])
  const [teacherName, setTeacherName] = useState<string>('')

  // === LOG TO DEBUG ===
  console.log("All bookings for", format(form.date, 'yyyy-MM-dd'), bookings);

  useEffect(() => {
  console.log('[Debug] Loading bookings for:', format(form.date, 'yyyy-MM-dd'))
  loadBookings()
}, [form.date])

  async function loadBookings() {
    try {
      const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .order('created_at', { ascending: false })
      if (error) throw error
      setBookings((data as Booking[]) || [])
    } catch (error) {
      console.error('Error loading bookings:', error)
      toast({
        title: "Error",
        description: "Failed to load bookings. Please ensure you're connected to Supabase.",
        variant: "destructive",
      })
    }
  }

  // === SAFE SLOT CHECK FUNCTION ===
function isSlotTaken(hour: number): boolean {
  const taken = bookings.some(
    (booking) =>
      booking.status === 'approved' &&
      booking.date === format(form.date, 'yyyy-MM-dd') &&
      (
        Array.isArray(booking.times)
          ? booking.times.map(String).includes(String(hour))
          : typeof booking.times === "string"
            ? booking.times.split(',').map(s => s.trim()).includes(String(hour))
            : false
      )
  );
  console.log(`[DEBUG] Hour: ${hour} is taken?`, taken);
  return taken;
}
 async function submitBooking(): Promise<void> {
  try {
    await supabase.from('bookings').insert([
      {
        name: form.name,
        class: form.class,
        date: format(form.date, 'yyyy-MM-dd'),
        times: form.times,
        status: 'pending',
      },
    ])
    toast({
      title: "Booking Submitted",
      description: "Your booking request has been submitted successfully!",
    })
    setForm({ ...form, name: '', class: '', times: [] })
    await loadBookings()
  } catch (error) {
    toast({
      title: "Submission Failed",
      description: "There was an error submitting your booking. Please try again.",
      variant: "destructive",
    })
    console.error('[submitBooking] Error:', error)
  }
}




  async function checkStatus() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('name', teacherName)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setStatusList((data as Booking[]) || [])
    } catch (error) {
      console.error('Error checking status:', error)
      throw error
    }
  }

  async function approveBooking(id: string, status: 'pending' | 'approved' | 'rejected') {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      loadBookings()
    } catch (error) {
      console.error('Error updating booking:', error)
      throw error
    }
  }

  async function exportReport() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      downloadPdf(data || [])
    } catch (error) {
      console.error('Error exporting report:', error)
      throw error
    }
  }

 async function handleAdminLogin(password: string): Promise<void> {
  if (password === 'ezatulcomel') {
    setIsAdminAuthenticated(true)
    toast({
      title: "Login Successful",
      description: "Welcome to the admin panel!",
    })
  } else {
    toast({
      title: "Login Failed",
      description: "Incorrect password. Please try again.",
      variant: "destructive",
    })
  }
}

  function handleAdminLogout() {
    setIsAdminAuthenticated(false)
    setActiveTab('booking')
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin panel.",
    })
  }

  // Reset admin authentication when switching away from admin tab
  useEffect(() => {
    if (activeTab !== 'admin') {
      setIsAdminAuthenticated(false)
    }
  }, [activeTab])

  const tabs = [
    { id: 'booking', label: 'Book Slot', icon: CalendarDays, color: 'bg-blue-600' },
    { id: 'status', label: 'Check Status', icon: Search, color: 'bg-green-600' },
    { id: 'admin', label: 'Admin Panel', icon: Shield, color: 'bg-purple-600' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Teacher Booking System
          </h1>
          <p className="text-lg text-gray-600">
            Manage your teaching time slots efficiently
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'booking' | 'status' | 'admin')}
                variant={activeTab === tab.id ? "default" : "outline"}
                className={`
                  flex items-center gap-2 px-6 py-3 text-lg font-semibold transition-all duration-200
                  ${activeTab === tab.id
                    ? `${tab.color} hover:opacity-90 text-white shadow-lg`
                    : 'hover:bg-gray-50 border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </Button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'booking' && (
            <BookingForm
              form={form}
              setForm={setForm}
              onSubmit={submitBooking}
              isSlotTaken={isSlotTaken}
            />
          )}

          {activeTab === 'status' && (
            <StatusChecker
              teacherName={teacherName}
              setTeacherName={setTeacherName}
              statusList={statusList}
              onCheckStatus={checkStatus}
            />
          )}

          {activeTab === 'admin' && (
            <>
              {!isAdminAuthenticated ? (
                <AdminLogin onLogin={handleAdminLogin} />
              ) : (
                <AdminPanel
                  bookings={bookings}
                  onApproveBooking={approveBooking}
                  onExportReport={exportReport}
                  onLogout={handleAdminLogout}
                />
              )}
            </>
          )}
        </div>
      </div>

      <Toaster />
    </div>
  )
}

export default App
