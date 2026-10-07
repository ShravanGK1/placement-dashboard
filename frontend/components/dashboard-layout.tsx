'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export interface NavItem {
  label: string
  href?: string
  icon: ReactNode
  onClick?: () => void
  active?: boolean
  badge?: string
}

interface DashboardLayoutProps {
  children: ReactNode
  navItems: NavItem[]
  title: string
  userInitial: string
  onOpenDsWorkbench?: () => void
  isDsWorkbenchActive?: boolean
}

export function DashboardLayout({
  children,
  navItems,
  title,
  userInitial,
  onOpenDsWorkbench,
  isDsWorkbenchActive,
}: DashboardLayoutProps) {
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
          {navItems.map((item, idx) => {
            const isActive = item.active;
            const content = (
              <>
                <span className="text-xl shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <span className="text-sm font-medium flex-1 flex items-center justify-between">
                    {item.label}
                    {item.badge && (
                      <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </>
            );

            if (item.onClick) {
              return (
                <button
                  key={item.label || idx}
                  type="button"
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-orange-100 text-orange-700 font-semibold shadow-xs'
                      : 'text-muted-foreground hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.href || idx}
                href={item.href || '#'}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-orange-100 text-orange-700 font-semibold shadow-xs'
                    : 'text-muted-foreground hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                {content}
              </Link>
            );
          })}
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-border sticky top-0 z-20">
          <div className="flex items-center justify-between h-16 px-4 md:px-8">
            <h1 className="text-xl font-semibold text-foreground truncate">{title}</h1>

            <div className="flex items-center gap-4">
              {onOpenDsWorkbench ? (
                <button
                  type="button"
                  onClick={onOpenDsWorkbench}
                  className={`hidden sm:flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-full border transition-all font-semibold shadow-sm ${
                    isDsWorkbenchActive
                      ? 'bg-indigo-600 text-white border-indigo-500 ring-2 ring-indigo-200'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isDsWorkbenchActive ? 'bg-amber-300' : 'bg-indigo-500'} animate-pulse`} />
                  <span>⚡ DS Modules (FA-2)</span>
                </button>
              ) : (
                <Link
                  href="/ds-demo"
                  className="hidden sm:flex items-center gap-2 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3.5 py-1.5 rounded-full border border-indigo-200 transition-all font-semibold shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span>⚡ DS Modules (FA-2)</span>
                </Link>
              )}

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
