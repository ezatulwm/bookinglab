import React, { useState, useEffect } from 'react'
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

function App() {
  const [activeTab, setActiveTab] = useState('booking')
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [form, setForm] = useState({
    name: '',
    class: '',
    date: new Date(),
    times: []
  })
  const [bookings, setBookings] = useState([])
  const [statusList, setStatusList] = useState([])
  const [teacherName, setTeacherName] = useState('')

  useEffect(() => {
    loadBookings()
  }, [form.date])

  async function loadBookings() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('date', format(form.date, 'yyyy-MM-dd'))
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error loading bookings:', error)
      toast({
        title: "Error",
        description: "Failed to load bookings. Please ensure you're connected to Supabase.",
        variant: "destructive",
      })
    }
  }

  function isSlotTaken(hour: number) {
    return bookings.some(
      (booking: any) => 
        booking.status === 'approved' && 
        booking.date === format(form.date, 'yyyy-MM-dd') && 
        booking.times.split(',').includes(hour.toString())
    )
  }

  async function submitBooking() {
    try {
      const { error } = await supabase.from('bookings').insert([{
        name: form.name,
        class: form.class,
        date: format(form.date, 'yyyy-MM-dd'),
        times: form.times.join(','),
        status: 'pending'
      }])
      
      if (error) throw error
      
      setForm({ ...form, name: '', class: '', times: [] })
      loadBookings()
    } catch (error) {
      console.error('Error submitting booking:', error)
      throw error
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
      setStatusList(data || [])
    } catch (error) {
      console.error('Error checking status:', error)
      throw error
    }
  }

  async function approveBooking(id: string, status: string) {
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

  function handleAdminLogin(password: string) {
    // Simple password check - in production, use proper authentication
    if (password === 'admin123') {
      setIsAdminAuthenticated(true)
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel!",
      })
      return true
    } else {
      toast({
        title: "Login Failed",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      })
      return false
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
                onClick={() => setActiveTab(tab.id)}
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