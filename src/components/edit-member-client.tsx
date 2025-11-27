'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format, parse } from 'date-fns'
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
import { Member } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import React from 'react'

const memberFormSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  gender: z.string().optional(),
  date_of_birth: z.date({
    message: 'Date of birth is required',
  }),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
})

type MemberFormValues = z.infer<typeof memberFormSchema>

interface EditMemberClientProps {
  member: Member
}

export function EditMemberClient({ member }: EditMemberClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(member.profile_picture_url)

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      full_name: member.full_name,
      gender: member.gender || '',
      date_of_birth: new Date(member.date_of_birth),
      phone: member.phone,
      email: member.email || '',
      address: member.address || '',
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
      let profilePictureUrl = member.profile_picture_url

      // Upload new profile picture if one was selected
      if (profilePicture) {
        const newUrl = await uploadProfilePicture(member.id, profilePicture)
        if (newUrl) {
          profilePictureUrl = newUrl
        }
      }

      // Update the member
      const { error: updateError } = await supabase
        .from('members')
        .update({
          full_name: values.full_name,
          gender: values.gender || null,
          date_of_birth: format(values.date_of_birth, 'yyyy-MM-dd'),
          phone: values.phone,
          email: values.email || null,
          address: values.address || null,
          profile_picture_url: profilePictureUrl,
        })
        .eq('id', member.id)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      router.push(`/members/${member.id}`)
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Member</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Update member information</p>
      </div>

      <Card className="border-0 shadow-xl">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl">Member Information</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
              {/* Profile Picture */}
              <div className="space-y-2">
                <FormLabel className="text-sm sm:text-base">Profile Picture</FormLabel>
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Upload className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="w-full">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={loading}
                      className="text-sm sm:text-base"
                    />
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Upload a new photo to replace the current one
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} disabled={loading} className="h-10 sm:h-11 text-sm sm:text-base" />
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
                    <FormLabel className="text-sm sm:text-base">Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                      <FormControl>
                        <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
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
                    <FormLabel className="text-sm sm:text-base">Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} disabled={loading} className="h-10 sm:h-11 text-sm sm:text-base" />
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
                    <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                        disabled={loading}
                        className="h-10 sm:h-11 text-sm sm:text-base"
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
                    <FormLabel className="text-sm sm:text-base">Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, City, State ZIP" {...field} disabled={loading} className="h-10 sm:h-11 text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="text-xs sm:text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button type="submit" disabled={loading} className="flex-1 h-10 sm:h-11 text-sm sm:text-base font-semibold">
                  {loading ? 'Saving Changes...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="h-10 sm:h-11 px-6 sm:px-8 text-sm sm:text-base font-semibold"
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
