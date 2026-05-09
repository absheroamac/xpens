'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSpaceStore } from '@/store/useSpaceStore'
import { useCategories, useCreateExpense } from '@/hooks/useQueries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AddExpensePage() {
  const router = useRouter()
  const { activeSpaceId } = useSpaceStore()
  const { data: categories, isLoading: loadingCategories } = useCategories(activeSpaceId || '')
  const { mutate: createExpense, isPending } = useCreateExpense()
  
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeSpaceId || !categoryId || !amount) return

    createExpense(
      {
        spaceId: activeSpaceId,
        categoryId,
        amount: parseFloat(amount),
        note
      },
      {
        onSuccess: () => {
          router.push('/dashboard/expenses')
        }
      }
    )
  }

  if (!activeSpaceId) {
    return <div className="p-6 pt-12 text-center text-muted-foreground">Please select a space first.</div>
  }

  return (
    <div className="p-6 pt-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Add Expense</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            required
            className="bg-surface text-2xl h-14"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">What was it for?</Label>
          <Input
            id="note"
            type="text"
            placeholder="e.g. Dinner"
            required
            className="bg-surface h-12"
            value={note}
            onChange={e => setNote(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          {loadingCategories ? (
            <p className="text-sm text-muted-foreground">Loading categories...</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {categories?.map(cat => (
                <Button
                  key={cat.id}
                  type="button"
                  variant={categoryId === cat.id ? 'default' : 'outline'}
                  className={`h-12 ${categoryId === cat.id ? 'bg-primary text-primary-foreground' : 'bg-surface text-foreground'}`}
                  onClick={() => setCategoryId(cat.id)}
                  disabled={isPending}
                >
                  {cat.name}
                </Button>
              ))}
              {(!categories || categories.length === 0) && (
                <p className="col-span-2 text-sm text-muted-foreground">No categories available. Add budgets first.</p>
              )}
            </div>
          )}
        </div>

        <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl mt-8" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Expense'}
        </Button>
      </form>
    </div>
  )
}
