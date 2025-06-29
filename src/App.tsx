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

  useEffect(() => {
    loadBookings()
    // eslint-disable-next-line
  }, [form.date])

  async function loadBookings() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('date', format(form.date, 'yyyy-MM-dd'))
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

  function isSlotTaken(hour: number): boolean {
    return bookings.some(
      (booking) =>
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

  function handleAdminLogin(password: string): boolean {
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
      descrip
