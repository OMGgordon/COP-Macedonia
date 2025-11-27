'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Member } from '@/lib/types'
import { formatDate, calculateAge } from '@/lib/birthdays'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, UserPlus } from 'lucide-react'

interface MembersListClientProps {
  members: Member[]
}

export function MembersListClient({ members }: MembersListClientProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members

    const term = searchTerm.toLowerCase()
    return members.filter(
      (member) =>
        member.full_name.toLowerCase().includes(term) ||
        member.phone.toLowerCase().includes(term) ||
        member.email?.toLowerCase().includes(term)
    )
  }, [members, searchTerm])

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
      {/* Header */}
      <div className="mb-6 sm:mb-8 relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-yellow-600 p-5 sm:p-6 lg:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Church Members</h1>
            <p className="text-sm sm:text-base lg:text-lg text-white/90">
              {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
              {searchTerm && ` found for "${searchTerm}"`}
            </p>
          </div>
          <Link href="/members/new" className="w-full sm:w-auto">
            <Button className="bg-white text-blue-900 hover:bg-white/90 font-semibold shadow-lg w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Add Member
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Card */}
      <Card className="mb-5 sm:mb-6 border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b p-4 sm:p-6">
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-3 sm:top-4 h-4 w-4 sm:h-5 sm:w-5 text-blue-900" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-200 focus:border-blue-900"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Members Grid/Table */}
      {filteredMembers.length === 0 ? (
        <Card className="border-0 shadow-xl">
          <div className="py-12 sm:py-16 px-4 text-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Search className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
              {searchTerm ? 'No Members Found' : 'No Members Yet'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6 max-w-md mx-auto">
              {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first member'}
            </p>
            {!searchTerm && (
              <Link href="/members/new">
                <Button className="bg-gradient-to-r from-blue-900 to-yellow-600 text-white h-10 sm:h-11 text-sm sm:text-base">
                  <UserPlus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Add Your First Member
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-50 to-yellow-50 hover:from-blue-50 hover:to-yellow-50">
                    <TableHead className="font-bold text-gray-700 text-xs sm:text-sm">Member</TableHead>
                    <TableHead className="font-bold text-gray-700 text-xs sm:text-sm hidden md:table-cell">Gender</TableHead>
                    <TableHead className="font-bold text-gray-700 text-xs sm:text-sm hidden lg:table-cell">Date of Birth</TableHead>
                    <TableHead className="font-bold text-gray-700 text-xs sm:text-sm hidden sm:table-cell">Age</TableHead>
                    <TableHead className="font-bold text-gray-700 text-xs sm:text-sm">Phone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow
                      key={member.id}
                      className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-yellow-50/50 transition-all"
                      onClick={() => window.location.href = `/members/${member.id}`}
                    >
                      <TableCell className="py-3 sm:py-4">
                        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                          <Avatar className="h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 border-2 border-blue-200 shadow-sm flex-shrink-0">
                            <AvatarImage src={member.profile_picture_url || undefined} alt={member.full_name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-900 to-yellow-600 text-white font-bold text-xs sm:text-sm">
                              {getInitials(member.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 text-xs sm:text-sm lg:text-base truncate">{member.full_name}</div>
                            {member.email && (
                              <div className="text-xs sm:text-sm text-gray-600 truncate hidden sm:block">{member.email}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-700 text-xs sm:text-sm hidden md:table-cell">{member.gender || '-'}</TableCell>
                      <TableCell className="font-medium text-gray-700 text-xs sm:text-sm hidden lg:table-cell">{formatDate(member.date_of_birth, 'MMM d, yyyy')}</TableCell>
                      <TableCell className="font-medium text-gray-700 text-xs sm:text-sm hidden sm:table-cell">{calculateAge(member.date_of_birth)} years</TableCell>
                      <TableCell className="font-medium text-gray-700 text-xs sm:text-sm">{member.phone}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
