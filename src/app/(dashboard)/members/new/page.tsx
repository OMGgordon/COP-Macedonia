'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Upload, Camera, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import React from 'react'
import { format } from 'date-fns'

const memberFormSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  gender: z.string().optional(),
  date_of_birth: z.date({
    message: 'Date of birth is required',
  }),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
})

type MemberFormValues = z.infer<typeof memberFormSchema>

export default function NewMemberPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showPhotoOptions, setShowPhotoOptions] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const cameraInputRef = React.useRef<HTMLInputElement>(null)

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      full_name: '',
      gender: '',
      phone: '',
      email: '',
      address: '',
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePicture(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadProfilePicture = async (memberId: string, file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${memberId}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('member-photos')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return null
    }

    const { data } = supabase.storage
      .from('member-photos')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const onSubmit = async (values: MemberFormValues) => {
    setLoading(true)
    setError(null)

    try {
      // Check for duplicates based on required fields
      const formattedDob = format(values.date_of_birth, 'yyyy-MM-dd')
      const { data: existingMembers, error: checkError } = await supabase
        .from('members')
        .select('full_name')
        .eq('date_of_birth', formattedDob)
        .eq('phone', values.phone)
        .eq('address', values.address)
        .ilike('full_name', `${values.full_name}%`)

      if (checkError) {
        setError(checkError.message)
        setLoading(false)
        return
      }

      // Determine the duplicate count
      let finalName = values.full_name
      if (existingMembers && existingMembers.length > 0) {
        // Count how many duplicates already exist
        const duplicateCount = existingMembers.length
        finalName = `${values.full_name} ${duplicateCount}`
      }

      // Insert the member with the potentially modified name
      const { data: member, error: insertError } = await supabase
        .from('members')
        .insert({
          full_name: finalName,
          gender: values.gender || null,
          date_of_birth: formattedDob,
          phone: values.phone,
          email: values.email || null,
          address: values.address || null,
        })
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }

      // If there's a profile picture, upload it and update the member
      if (profilePicture && member) {
        const publicUrl = await uploadProfilePicture(member.id, profilePicture)
        
        if (publicUrl) {
          await supabase
            .from('members')
            .update({ profile_picture_url: publicUrl })
            .eq('id', member.id)
        }
      }

      router.push('/members')
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
      {/* Hero Header */}
      <div className="mb-6 sm:mb-8 relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-yellow-600 p-5 sm:p-6 lg:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Add New Member</h1>
          <p className="text-sm sm:text-base lg:text-lg text-white/90">Fill in the details to add a new member to COP, Macedonia Assembly</p>
        </div>
      </div>

      <Card className="border-0 shadow-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-yellow-50 border-b-2 border-blue-100 p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gray-900 flex items-center gap-2">
            <div className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-lg sm:rounded-xl bg-yellow-600 flex items-center justify-center text-white shadow-lg">
              <Upload className="h-4 w-4 sm:h-4.5 lg:h-5 sm:w-4.5 lg:w-5" />
            </div>
            Member Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
              {/* Profile Picture */}
              <div className="space-y-2 sm:space-y-3">
                <FormLabel className="text-sm sm:text-base font-semibold text-gray-700">Profile Picture</FormLabel>
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-50 to-yellow-50 border-2 border-blue-100">
                  <div 
                    onClick={() => setShowPhotoOptions(true)}
                    className="cursor-pointer group relative"
                  >
                    {previewUrl ? (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 rounded-xl sm:rounded-2xl object-cover border-3 sm:border-4 border-white shadow-xl ring-2 ring-blue-200 flex-shrink-0"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-200 to-yellow-200 flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Upload className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-900" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <p className="text-xs sm:text-sm text-gray-600 font-medium mb-2">
                      Tap the icon to take a photo or upload from device (optional)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => cameraInputRef.current?.click()}
                        disabled={loading}
                        className="flex-1 border-blue-200 hover:bg-blue-50"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Camera
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="flex-1 border-blue-200 hover:bg-blue-50"
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                    {/* Hidden file inputs */}
                    <Input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      disabled={loading}
                      className="hidden"
                    />
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={loading}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base font-semibold text-gray-700">Full Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe" 
                        {...field} 
                        disabled={loading}
                        className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-blue-900"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gender */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base font-semibold text-gray-700">Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                      <FormControl>
                        <SelectTrigger className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-blue-900">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date of Birth */}
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => {
                  const [open, setOpen] = React.useState(false)
                  const [month, setMonth] = React.useState<Date | undefined>(field.value || new Date(2000, 0))
                  const [value, setValue] = React.useState(formatDate(field.value))

                  const isValidDate = (date: Date | undefined) => {
                    if (!date) return false
                    return !isNaN(date.getTime())
                  }

                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel className="px-1">Date of Birth *</FormLabel>
                      <div className="relative flex gap-2">
                        <Input
                          value={value}
                          placeholder="June 01, 2025"
                          className="bg-background pr-10"
                          disabled={loading}
                          onChange={(e) => {
                            const date = new Date(e.target.value)
                            setValue(e.target.value)
                            if (isValidDate(date) && date <= new Date() && date >= new Date('1900-01-01')) {
                              field.onChange(date)
                              setMonth(date)
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowDown") {
                              e.preventDefault()
                              setOpen(true)
                            }
                          }}
                        />
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                              disabled={loading}
                            >
                              <CalendarIcon className="size-3.5" />
                              <span className="sr-only">Select date</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="end"
                            alignOffset={-8}
                            sideOffset={10}
                          >
                            <Calendar
                              mode="single"
                              selected={field.value}
                              captionLayout="dropdown"
                              month={month}
                              onMonthChange={setMonth}
                              fromYear={1900}
                              toYear={new Date().getFullYear()}
                              disabled={(date) =>
                                date > new Date() || date < new Date('1900-01-01')
                              }
                              onSelect={(date) => {
                                field.onChange(date)
                                setValue(formatDate(date))
                                setOpen(false)
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base font-semibold text-gray-700">Phone Number *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+233 *********" 
                        {...field} 
                        disabled={loading}
                        className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-blue-900"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base font-semibold text-gray-700">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                        disabled={loading}
                        className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-blue-900"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base font-semibold text-gray-700">Address *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123 Main St, City, State ZIP" 
                        {...field} 
                        disabled={loading}
                        className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-blue-900"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="text-xs sm:text-sm text-red-700 bg-red-50 border-2 border-red-200 p-3 sm:p-4 rounded-lg sm:rounded-xl font-medium">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 h-10 sm:h-11 lg:h-12 text-sm sm:text-base bg-blue-900 hover:bg-blue-950 shadow-lg font-semibold"
                >
                  {loading ? 'Adding Member...' : 'Add Member'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="h-10 sm:h-11 lg:h-12 px-6 sm:px-8 text-sm sm:text-base border-2 border-gray-300 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
