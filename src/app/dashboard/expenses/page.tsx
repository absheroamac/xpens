'use client'

import { useState, useMemo } from 'react'
import { useSpaceStore } from '@/store/useSpaceStore'
import { useExpenses, useCategories, useSpaceMembers, useProfile } from '@/hooks/useQueries'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatDistanceToNow } from 'date-fns'
import { Search, Filter } from 'lucide-react'

export default function ExpensesPage() {
  const { activeSpaceId } = useSpaceStore()
  const { data: expenses, isLoading: loadingExpenses } = useExpenses(activeSpaceId || '')
  const { data: categories } = useCategories(activeSpaceId || '')
  const { data: members } = useSpaceMembers(activeSpaceId || '')
  const { data: profile } = useProfile()
  
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('all')

  const filteredExpenses = useMemo(() => {
    if (!expenses) return []
    return expenses.filter(exp => {
      const note = exp.note || ''
      const matchesSearch = note.toLowerCase().includes(search.toLowerCase()) || exp.amount.toString().includes(search)
      const matchesCat = categoryId === 'all' || exp.category_id === categoryId
      return matchesSearch && matchesCat
    })
  }, [expenses, search, categoryId])

  const totalFiltered = filteredExpenses.reduce((acc, exp) => acc + Number(exp.amount), 0)

  if (!activeSpaceId) {
    return <div className="p-6 pt-12 text-center text-muted-foreground">Please select a space first.</div>
  }

  return (
    <div className="p-6 pt-12 pb-32 min-h-screen relative">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Expenses</h1>
      </header>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search expenses..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-surface border-none shadow-sm"
          />
        </div>
        <div className="relative w-1/3">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select 
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full h-10 pl-9 pr-8 rounded-md bg-surface text-sm border-none shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All</option>
            {categories?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loadingExpenses ? (
        <p className="text-muted-foreground text-sm">Loading expenses...</p>
      ) : (
        <div className="space-y-4">
          {filteredExpenses.map(expense => {
            const category = categories?.find(c => c.id === expense.category_id)
            const isMe = profile && profile.id === expense.paid_by
            
            let payerName = 'Unknown'
            if (isMe) {
              payerName = 'You'
            } else {
              const member: any = members?.find((m: any) => m.user_id === expense.paid_by)
              const p = member?.profiles
              const name = Array.isArray(p) ? p[0]?.name : p?.name
              payerName = name || `User ${expense.paid_by?.substring(0, 4) || 'Unk'}`
            }
            
            return (
              <Card key={expense.id} className="bg-surface border-none shadow-sm">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-foreground">{expense.note || 'Untitled Expense'}</p>
                    <p className="text-xs text-muted-foreground">{category?.name || 'Uncategorized'} • {formatDistanceToNow(new Date(expense.created_at))} ago • Paid by {payerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">₹{expense.amount.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {(!filteredExpenses || filteredExpenses.length === 0) && (
            <p className="text-muted-foreground text-center py-8">No expenses match your filters.</p>
          )}
        </div>
      )}

      {/* Sticky Total Footer */}
      <div className="fixed bottom-24 left-0 right-0 p-4 z-10 pointer-events-none">
        <div className="max-w-md mx-auto bg-primary text-primary-foreground rounded-xl shadow-lg p-4 px-6 flex justify-between items-center pointer-events-auto backdrop-blur-md bg-opacity-95">
          <span className="font-medium text-sm uppercase tracking-wide opacity-90">Total Listed</span>
          <span className="text-xl font-bold tracking-tight">₹{totalFiltered.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
