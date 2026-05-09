'use client'

import Link from 'next/link'
import { Home, List, PlusCircle, Users, LayoutGrid } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border px-6 py-3 flex justify-between items-center z-50">
      <Link href="/dashboard" className={`flex flex-col items-center gap-1 hover:text-white transition-colors ${pathname === '/dashboard' ? 'text-white' : 'text-muted-foreground'}`}>
        <Home className="w-6 h-6" />
        <span className="text-xs">Home</span>
      </Link>
      <Link href="/dashboard/expenses" className={`flex flex-col items-center gap-1 hover:text-white transition-colors ${pathname === '/dashboard/expenses' ? 'text-white' : 'text-muted-foreground'}`}>
        <List className="w-6 h-6" />
        <span className="text-xs">Expenses</span>
      </Link>
      <Link href="/dashboard/add-expense" className="flex flex-col items-center gap-1 text-primary">
        <PlusCircle className="w-10 h-10 -mt-6 bg-background rounded-full" />
      </Link>
      <Link href="/dashboard/settlements" className={`flex flex-col items-center gap-1 hover:text-white transition-colors ${pathname === '/dashboard/settlements' ? 'text-white' : 'text-muted-foreground'}`}>
        <Users className="w-6 h-6" />
        <span className="text-xs">Settlements</span>
      </Link>
      <Link href="/dashboard/spaces" className={`flex flex-col items-center gap-1 hover:text-white transition-colors ${pathname?.startsWith('/dashboard/spaces') ? 'text-white' : 'text-muted-foreground'}`}>
        <LayoutGrid className="w-6 h-6" />
        <span className="text-xs">Spaces</span>
      </Link>
    </nav>
  )
}
