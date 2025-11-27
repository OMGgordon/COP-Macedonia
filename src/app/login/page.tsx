'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      if (data.session) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-blue-50 via-white to-yellow-50 border-0 shadow-2xl">
        <CardHeader className="space-y-3 sm:space-y-4 p-5 sm:p-6">
          <div className="flex justify-center">
            <Image 
              src="/logo.png" 
              alt="COP Logo" 
              width={64} 
              height={64}
              className="object-contain sm:w-20 sm:h-20"
            />
          </div>
          <div className="text-center space-y-0.5 sm:space-y-1">
            <CardTitle className="text-xl sm:text-2xl font-bold">Church of Pentecost</CardTitle>
            <p className="text-base sm:text-lg font-medium text-gray-700">Macedonia Assembly</p>
          </div>
          <CardDescription className="text-center text-sm sm:text-base">
            Sign in to manage member information
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@church.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
            {error && (
              <div className="text-xs sm:text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-950 h-10 sm:h-11 text-sm sm:text-base font-semibold" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
