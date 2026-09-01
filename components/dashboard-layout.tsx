'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface NavItem {
  label: string
  href: string
  icon: ReactNode
}

interface DashboardLayoutProps {
  children: ReactNode
  navItems: NavItem[]
  title: string
  userInitial: string
}

export function DashboardLayout({ children, navItems, title, userInitial }: DashboardLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('userRole')
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-border transition-all duration-300 hidden md:flex flex-col`}>
        <div className="p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <span className="text-lg font-bold text-orange-600">CP</span>
            </div>
            {sidebarOpen && <span className="font-bold text-lg">Placement</span>}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-orange-50 hover:text-orange-600 transition-colors"
            >
              <span className="text-xl shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-orange-50 hover:text-orange-600 transition-colors mb-2"
          >
            <Menu className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 md:px-8">
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-xs bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full border border-orange-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono font-medium">DS Tracing Active (X-Request-Id)</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
          {children}  
        </main>
      </div>
    </div>
  )
}
