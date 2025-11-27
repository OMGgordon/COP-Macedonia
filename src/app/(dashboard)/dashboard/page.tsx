import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getTodaysBirthdays, getUpcomingBirthdays, formatBirthday, daysUntilBirthday } from '@/lib/birthdays'
import { Member } from '@/lib/types'
import { Users, Calendar, Cake, Phone, Mail, PartyPopper, Gift, Sparkles, UserPlus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: members, error } = await supabase
    .from('members')
    .select('*')
    .order('full_name', { ascending: true })

  const memberCount = members?.length || 0
  const todaysBirthdays = members ? getTodaysBirthdays(members as Member[]) : []
  const upcomingBirthdays = members ? getUpcomingBirthdays(members as Member[], 7) : []

  function getInitials(name: string) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
      {/* Hero Section */}
      <div className="mb-6 sm:mb-8 relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-yellow-600 p-5 sm:p-6 lg:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <Sparkles className="h-6 w-6 sm:h-7 lg:h-8" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Welcome Back!</h1>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-white/90 mb-4 sm:mb-6">Manage your church community with ease</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Link href="/members/new" className="w-full sm:w-auto">
              <Button className="bg-white text-purple-600 hover:bg-white/90 font-semibold w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Member
              </Button>
            </Link>
            <Link href="/members" className="w-full sm:w-auto">
              <Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm w-full sm:w-auto">
                <Users className="mr-2 h-4 w-4" />
                View All Members
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 sm:mb-8 lg:mb-10 grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide">Total Members</CardTitle>
              <div className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center shadow-lg">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">{memberCount}</div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 font-medium">
              Active church members
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-500 opacity-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide">Birthdays Today</CardTitle>
              <div className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg">
              <PartyPopper className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-pink-600 to-rose-600 bg-clip-text text-transparent">{todaysBirthdays.length}</div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 font-medium">
              {todaysBirthdays.length === 1 ? 'Member celebrating' : 'Members celebrating'}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 opacity-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide">Coming Up</CardTitle>
              <div className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-xl sm:rounded-2xl bg-blue-900 flex items-center justify-center shadow-lg">
              <Gift className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent">{upcomingBirthdays.length}</div>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Next 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Birthdays */}
      {todaysBirthdays.length > 0 && (
        <Card className="mb-6 sm:mb-8 border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white pb-5 sm:pb-6 lg:pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="flex items-center text-lg sm:text-xl lg:text-2xl">
                <div className="h-10 w-10 sm:h-11 lg:h-12 sm:w-11 lg:w-12 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-2 sm:mr-3">
                  <PartyPopper className="h-5 w-5 sm:h-5.5 lg:h-6 sm:w-5.5 lg:w-6" />
                </div>
                <span className="font-bold">Celebrating Today! 🎉</span>
              </CardTitle>
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs sm:text-sm">
                {todaysBirthdays.length} {todaysBirthdays.length === 1 ? 'Birthday' : 'Birthdays'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-5 lg:pt-6 bg-gradient-to-br from-pink-50 to-rose-50">
            <div className="space-y-3 sm:space-y-4">
              {todaysBirthdays.map((member) => (
                <Link
                  key={member.id}
                  href={`/members/${member.id}`}
                  className="group flex items-center space-x-3 sm:space-x-4 rounded-xl sm:rounded-2xl border-2 border-pink-200 bg-white p-3 sm:p-4 lg:p-5 hover:shadow-xl transition-all hover:-translate-y-0.5 hover:border-pink-300"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 border-2 sm:border-3 border-pink-300 ring-2 sm:ring-4 ring-pink-100">
                      <AvatarImage src={member.profile_picture_url || undefined} alt={member.full_name} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-400 text-white text-sm sm:text-base lg:text-lg font-bold">{getInitials(member.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg">
                      <Cake className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-900" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1 sm:space-y-2 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <p className="font-bold text-gray-900 text-sm sm:text-base lg:text-xl truncate">{member.full_name}</p>
                      <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 shadow-md text-xs whitespace-nowrap">
                        🎂 Turns {member.age}!
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 text-xs sm:text-sm text-gray-700">
                      <span className="flex items-center gap-1.5 sm:gap-2 font-medium">
                        <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-md sm:rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                          <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-pink-600" />
                        </div>
                        <span className="truncate">{member.phone}</span>
                      </span>
                      {member.email && (
                        <span className="flex items-center gap-1.5 sm:gap-2 font-medium">
                          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-md sm:rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-pink-600" />
                          </div>
                          <span className="truncate">{member.email}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-pink-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all flex-shrink-0 hidden sm:block" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Birthdays */}
      {upcomingBirthdays.length > 0 && (
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-blue-900 text-white pb-5 sm:pb-6 lg:pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="flex items-center text-lg sm:text-xl lg:text-2xl">
                <div className="h-10 w-10 sm:h-11 lg:h-12 sm:w-11 lg:w-12 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-2 sm:mr-3">
                  <Gift className="h-5 w-5 sm:h-5.5 lg:h-6 sm:w-5.5 lg:w-6" />
                </div>
                <span className="font-bold">Coming Soon</span>
              </CardTitle>
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs sm:text-sm">
                Next 7 Days
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-5 lg:pt-6 bg-gray-50">
            <div className="space-y-3 sm:space-y-4">
              {upcomingBirthdays.map((member) => {
                const daysUntil = daysUntilBirthday(member.date_of_birth)
                return (
                  <Link
                    key={member.id}
                    href={`/members/${member.id}`}
                    className="group flex items-center space-x-3 sm:space-x-4 rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-white p-3 sm:p-4 lg:p-5 hover:shadow-xl transition-all hover:-translate-y-0.5 hover:border-blue-900"
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 border-2 sm:border-3 border-gray-200 ring-2 sm:ring-4 ring-gray-100">
                        <AvatarImage src={member.profile_picture_url || undefined} alt={member.full_name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-900 to-yellow-600 text-white text-sm sm:text-base lg:text-lg font-bold">{getInitials(member.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-blue-900 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                        {daysUntil}
                      </div>
                    </div>
                    <div className="flex-1 space-y-1 sm:space-y-2 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <p className="font-bold text-gray-900 text-sm sm:text-base lg:text-xl truncate">{member.full_name}</p>
                        <Badge className="bg-blue-900 text-white border-0 shadow-md text-xs whitespace-nowrap">
                          {formatBirthday(member.date_of_birth)}
                        </Badge>
                        <Badge variant="outline" className="border-gray-300 text-gray-700 bg-gray-50 font-semibold text-xs whitespace-nowrap">
                          {daysUntil} {daysUntil === 1 ? 'day' : 'days'} away
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 text-xs sm:text-sm text-gray-700">
                        <span className="flex items-center gap-1.5 sm:gap-2 font-medium">
                          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-md sm:rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" />
                          </div>
                          <span className="truncate">{member.phone}</span>
                        </span>
                        {member.email && (
                          <span className="flex items-center gap-1.5 sm:gap-2 font-medium">
                            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-md sm:rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" />
                            </div>
                            <span className="truncate">{member.email}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-900 group-hover:translate-x-1 transition-all flex-shrink-0 hidden sm:block" />
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No birthdays message */}
      {todaysBirthdays.length === 0 && upcomingBirthdays.length === 0 && (
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 sm:p-10 lg:p-12 text-center">
            <div className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-2xl sm:rounded-3xl bg-white shadow-lg flex items-center justify-center mx-auto mb-4 sm:mb-5 lg:mb-6">
              <Cake className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2">All Quiet on the Birthday Front</h3>
            <p className="text-sm sm:text-base text-gray-600 font-medium mb-3 sm:mb-4">No birthdays today or in the next 7 days</p>
            <p className="text-xs sm:text-sm text-gray-500">Check back later for upcoming celebrations! 🎉</p>
          </div>
        </Card>
      )}
    </div>
  )
}
