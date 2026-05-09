'use client'

import { useSpaceStore } from '@/store/useSpaceStore'
import { useExpenses, useCategories } from '@/hooks/useQueries'
import { Card, CardContent } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'

export default function ExpensesPage() {
  const { activeSpaceId } = useSpaceStore()
  const { data: expenses, isLoading: loadingExpenses } = useExpenses(activeSpaceId || '')
  const { data: categories } = useCategories(activeSpaceId || '')
  
  if (!activeSpaceId) {
    return <div className="p-6 pt-12 text-center text-muted-foreground">Please select a space first.</div>
  }

  return (
    <div className="p-6 pt-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Expenses</h1>
      </header>

      {loadingExpenses ? (
        <p className="text-muted-foreground text-sm">Loading expenses...</p>
      ) : (
        <div className="space-y-4">
          {expenses?.map(expense => {
            const category = categories?.find(c => c.id === expense.category_id)
            return (
              <Card key={expense.id} className="bg-surface border-none shadow-sm">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-foreground">{expense.note || 'Untitled Expense'}</p>
                    <p className="text-xs text-muted-foreground">{category?.name || 'Uncategorized'} • {formatDistanceToNow(new Date(expense.created_at))} ago</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">₹{expense.amount.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {(!expenses || expenses.length === 0) && (
            <p className="text-muted-foreground text-center py-8">No expenses yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
