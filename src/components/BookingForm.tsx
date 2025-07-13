import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { CalendarDays, Clock, User, GraduationCap, CheckCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface BookingFormProps {
  form: {
    name: string
    email: string    // <-- Added email field
    class: string
    date: Date
    times: number[]
  }
  setForm: (form: any) => void
  onSubmit: () => Promise<boolean>
  isSlotTaken: (hour: number) => boolean
}

const timeSlots = Array.from({ length: 10 }, (_, i) => 8 + i)

export default function BookingForm({ form, setForm, onSubmit, isSlotTaken }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Toast test
  useEffect(() => {
    toast({
      title: "🧪 Toast Test",
      description: "If you see this, toast is working.",
    })
  }, [])

  const handleSubmit = async () => {
    console.log('Submit button clicked!')
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.class.trim() ||
      form.times.length === 0
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select at least one time slot.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const success = await onSubmit()
      console.log('[handleSubmit] Submission success?', success)

      if (success) {
        // 🔔 Notify admin via Netlify function!
        await fetch('/.netlify/functions/notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            bookingInfo: form,
          }),
        })

        toast({
          title: "Booking Submitted",
          description: "Your booking request has been submitted successfully!",
        })
      } else {
        toast({
          title: "Submission Failed",
          description: "There was an error submitting your booking. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Unexpected Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTimeSlot = (hour: number) => {
    setForm({
      ...form,
      times: form.times.includes(hour)
        ? form.times.filter(h => h !== hour)
        : [...form.times, hour].sort()
    })
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-blue-600" />
          Book a Time Slot
        </CardTitle>
        <p className="text-gray-600">Reserve your preferred teaching time slots</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form
          onSubmit={e => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="teacher-name" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <User className="h-4 w-4" />
                Teacher Name
              </Label>
              <Input
                id="teacher-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your full name"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-email" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <User className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="teacher-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Enter your email"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                Class/Subject
              </Label>
              <Input
                id="class"
                value={form.class}
                onChange={(e) => setForm({ ...form, class: e.target.value })}
                placeholder="e.g., Math 101, Physics Lab"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <Label className="text-sm font-semibold text-gray-700">Select Date</Label>
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <Calendar
                mode="single"
                selected={form.date}
                onSelect={(date) => date && setForm({ ...form, date })}
                disabled={(date) => date < new Date()}
                className="rounded-md"
              />
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Available Time Slots
            </Label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {timeSlots.map((hour) => {
                const isSelected = form.times.includes(hour)
                const taken = isSlotTaken(hour)

                return (
                  <Button
                    key={hour}
                    variant={isSelected ? "default" : "outline"}
                    disabled={taken}
                    onClick={() => toggleTimeSlot(hour)}
                    type="button"
                    className={`
                      relative transition-all duration-200
                      ${isSelected 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                        : 'hover:bg-blue-50 hover:border-blue-300'
                      }
                      ${taken ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
                    `}
                  >
                    {isSelected && <CheckCircle className="h-3 w-3 absolute -top-1 -right-1" />}
                    {hour}:00
                    {taken && <div className="text-xs text-red-500 mt-1">Taken</div>}
                  </Button>
                )
              })}
            </div>
            <p className="text-sm text-gray-500">
              Selected: {form.times.length} slot{form.times.length !== 1 ? 's' : ''}
              {form.times.length > 0 && ` (${form.times.map(t => `${t}:00`).join(', ')})`}
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold transition-colors duration-200 mt-4"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
