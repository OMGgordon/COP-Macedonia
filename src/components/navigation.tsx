'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LogoutButton } from './logout-button'
import { LayoutDashboard, Users, UserPlus } from 'lucide-react'
import Image from 'next/image'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Add Member', href: '/members/new', icon: UserPlus },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="COP Logo" 
                width={40} 
                height={40}
                className="object-contain"
              />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-800 bg-clip-text text-transparent">COP, Macedonia Assembly</h1>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || 
                  (item.href === '/members' && pathname?.startsWith('/members') && pathname !== '/members/new')
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors',
                      isActive
                        ? 'border-blue-900 text-blue-900'
                        : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center">
            <LogoutButton />
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="sm:hidden border-t">
        <div className="space-y-1 pb-3 pt-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href === '/members' && pathname?.startsWith('/members') && pathname !== '/members/new')
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center border-l-4 py-2 pl-3 pr-4 text-base font-medium',
                  isActive
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-transparent text-muted-foreground hover:border-gray-300 hover:bg-gray-50 hover:text-foreground'
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
