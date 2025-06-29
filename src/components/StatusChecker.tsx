import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Search, Clock, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface StatusCheckerProps {
  teacherName: string
  setTeacherName: (name: string) => void
  statusList: any[]
  onCheckStatus: () => Promise<void>
}

export default function StatusChecker({ teacherName, setTeacherName, statusList, onCheckStatus }: StatusCheckerProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheck = async () => {
    if (!teacherName.trim()) return
    setIsLoading(true)
    try {
      await onCheckStatus()
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-amber-600" />
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

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50/30">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Search className="h-6 w-6 text-green-600" />
          Check Booking Status
        </CardTitle>
        <p className="text-gray-600">View your recent booking requests and their status</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="teacher-search" className="text-sm font-semibold text-gray-700 mb-2 block">
              Enter Your Name
            </Label>
            <Input
              id="teacher-search"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="Enter your full name to check status"
              className="border-gray-200 focus:border-green-500 focus:ring-green-500"
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={handleCheck}
              disabled={!teacherName.trim() || isLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-6"
            >
              {isLoading ? 'Checking...' : 'Check Status'}
            </Button>
          </div>
        </div>

        {statusList.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
            <div className="space-y-3">
              {statusList.map((booking, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">
                        {format(new Date(booking.date), 'PPP')}
                      </span>
                    </div>
                    <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1`}>
                      {getStatusIcon(booking.status)}
                      {booking.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Time slots: {Array.isArray(booking.times)
  ? booking.times.map((t: number) => `${t}:00`).join(', ')
  : booking.times
}</span>
                    </div>
                    <div>
                      <span className="font-medium">Class:</span> {booking.class}
                    </div>
                    <div>
                      <span className="font-medium">Submitted:</span> {format(new Date(booking.created_at), 'PPp')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {statusList.length === 0 && teacherName && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No bookings found for "{teacherName}"</p>
            <p className="text-sm">Make sure the name matches exactly as submitted</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
