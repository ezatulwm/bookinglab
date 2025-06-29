import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { CalendarDays, Clock, User, GraduationCap, CheckCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

// ...rest of your code stays exactly the same...


interface BookingFormProps {
  form: {
    name: string
    class: string
    date: Date
    times: number[]
  }
  setForm: (form: any) => void
  onSubmit: () => Promise<void>
  isSlotTaken: (hour: number) => boolean
}

const timeSlots = Array.from({ length: 10 }, (_, i) => 8 + i) // 8am to 5pm

export default function BookingForm({ form, setForm, onSubmit, isSlotTaken }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    console.log('Submit button clicked!');
    if (!form.name.trim() || !form.class.trim() || form.times.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select at least one time slot.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit()
      toast({
        title: "Booking Submitted",
        description: "Your booking request has been submitted successfully!",
      })
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your booking. Please try again.",
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
      {/* --- START FORM --- */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSubmit();
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

          {/* ---- Continue with all your other fields below as normal ---- */}
          {/* Your "Class/Subject" input, Date calendar, Time slots, etc. */}

        </div>

        {/* --- Don't forget to move your Submit Button inside the form --- */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold transition-colors duration-200"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
        </Button>
      </form>
      {/* --- END FORM --- */}
    </CardContent>
  </Card>
)

}
