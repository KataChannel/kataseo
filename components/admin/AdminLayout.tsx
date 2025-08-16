"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  FileText,
  PlusCircle,
  Settings,
  BarChart3,
  Users,
  Home,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

interface AdminSidebarProps {
  className?: string
}

const navigation = [
  { name: 'Tổng quan', href: '/admin', icon: Home },
  { name: 'Trang', href: '/admin/pages', icon: FileText },
  { name: 'Bài viết', href: '/admin/posts', icon: FileText },
  { name: 'Thêm mới', href: '/admin/create', icon: PlusCircle },
  { name: 'Phân tích', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Người dùng', href: '/admin/users', icon: Users },
  { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 transform transition-transform lg:transform-none lg:static",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="p-6">
          <Link href="/admin" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded text-white flex items-center justify-center font-bold">
              K
            </div>
            <span className="text-xl font-bold text-gray-900">KataSEO</span>
          </Link>
        </div>

        <nav className="px-3 pb-6">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href))
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  action?: React.ReactNode
}

export function AdminLayout({ children, title, action }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-0">
        <div className="px-6 py-8 lg:px-8">
          {title && (
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {action && <div>{action}</div>}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}
