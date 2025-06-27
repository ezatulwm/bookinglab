import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Lock, Eye, EyeOff } from 'lucide-react'

interface AdminLoginProps {
  onLogin: (password: string) => boolean
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return

    setIsLoading(true)
    
    // Add a small delay to simulate authentication process
    setTimeout(() => {
      const success = onLogin(password)
      if (!success) {
        setPassword('')
      }
      setIsLoading(false)
    }, 500)
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50/30 max-w-md mx-auto">
      <CardHeader className="space-y-1 pb-6 text-center">
        <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-purple-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Admin Access
        </CardTitle>
        <p className="text-gray-600">Enter the admin password to continue</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              <Lock className="h-4 w-4" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 pr-10"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <Button 
            type="submit"
            disabled={!password.trim() || isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold transition-colors duration-200"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Authenticating...
              </div>
            ) : (
              'Access Admin Panel'
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Lock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Demo Credentials</p>
              <p>Password: <code className="bg-amber-100 px-1 rounded">admin123</code></p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}