import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Member } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DeleteMemberButton } from '@/components/delete-member-button'
import { formatDate, calculateAge, formatBirthday } from '@/lib/birthdays'
import { Edit, Phone, Mail, MapPin, Calendar, User, ArrowLeft, Cake } from 'lucide-react'

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: member, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !member) {
    notFound()
  }

  const typedMember = member as Member
  const age = calculateAge(typedMember.date_of_birth)

  function getInitials(name: string) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
      <div className="mb-4 sm:mb-6">
        <Link href="/members">
          <Button variant="ghost" size="sm" className="text-sm sm:text-base">
            <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Back to Members
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-xl">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 border-4 border-gray-100 shadow-lg">
              <AvatarImage src={typedMember.profile_picture_url || undefined} alt={typedMember.full_name} />
              <AvatarFallback className="text-2xl sm:text-2xl lg:text-3xl bg-gradient-to-br from-blue-900 to-yellow-600 text-white">{getInitials(typedMember.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl mb-2">{typedMember.full_name}</CardTitle>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {typedMember.gender && (
                  <Badge variant="secondary" className="text-xs sm:text-sm">{typedMember.gender}</Badge>
                )}
                <Badge variant="outline" className="text-xs sm:text-sm">
                  <Cake className="mr-1 h-3 w-3" />
                  {age} years old
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6">
          {/* Contact Information Section */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold flex items-center text-gray-900">
              <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
              Contact Information
            </h3>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
              <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-gray-50 border border-gray-100">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">{typedMember.phone}</p>
                </div>
              </div>
              {typedMember.email && (
                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900 break-all">{typedMember.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Birthday Information Section */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold flex items-center text-gray-900">
              <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
              Birthday Information
            </h3>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
              <div className="p-3 sm:p-4 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Date of Birth</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{formatDate(typedMember.date_of_birth, 'MMMM do, yyyy')}</p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Birthday</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{formatBirthday(typedMember.date_of_birth)}</p>
              </div>
            </div>
          </div>

          {/* Address Section */}
          {typedMember.address && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center text-gray-900">
                <MapPin className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                Address
              </h3>
              <div className="p-3 sm:p-4 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-sm sm:text-base font-semibold text-gray-900">{typedMember.address}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t">
            <Link href={`/members/${id}/edit`} className="flex-1">
              <Button className="w-full bg-gray-900 hover:bg-gray-800 h-10 sm:h-11 text-sm sm:text-base">
                <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Edit Member
              </Button>
            </Link>
            <DeleteMemberButton memberId={id} memberName={typedMember.full_name} />
          </div>

          {/* Metadata */}
          <div className="text-xs sm:text-sm text-gray-500 pt-3 sm:pt-4 border-t space-y-1">
            <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-medium">Added:</span>
              <span>{formatDate(typedMember.created_at, 'PPP')}</span>
            </p>
            {typedMember.updated_at !== typedMember.created_at && (
              <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-medium">Last updated:</span>
                <span>{formatDate(typedMember.updated_at, 'PPP')}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
