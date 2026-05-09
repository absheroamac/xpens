'use client'

import { useState } from 'react'
import { useSpaceStore } from '@/store/useSpaceStore'
import { useCategories, useCreateCategory } from '@/hooks/useQueries'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CategoriesPage() {
  const { activeSpaceId } = useSpaceStore()
  const { data: categories, isLoading } = useCategories(activeSpaceId || '')
  const { mutate: createCategory, isPending } = useCreateCategory()

  const [name, setName] = useState('')
  const [budget, setBudget] = useState('')

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !budget || !activeSpaceId) return
    
    createCategory(
      { spaceId: activeSpaceId, name, budget: parseFloat(budget) },
      {
        onSuccess: () => {
          setName('')
          setBudget('')
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
        <h1 className="text-3xl font-bold text-primary">Set Budgets</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage categories and their budget limits.</p>
      </header>

      {isLoading ? (
        <p className="text-muted-foreground text-sm mb-10">Loading budgets...</p>
      ) : (
        <div className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold text-foreground">Existing Budgets</h2>
          {categories?.map(cat => (
            <Card key={cat.id} className="bg-surface border-none shadow-sm">
              <CardContent className="p-4 flex justify-between items-center">
                <h3 className="font-semibold text-lg text-foreground">{cat.name}</h3>
                <span className="text-primary font-bold">₹{cat.budget.toLocaleString()}</span>
              </CardContent>
            </Card>
          ))}
          {(!categories || categories.length === 0) && (
            <p className="text-muted-foreground text-sm">No budgets set yet.</p>
          )}
        </div>
      )}

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Add New Budget</h2>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <Label htmlFor="catName">Category Name</Label>
              <Input 
                id="catName" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Groceries" 
                className="bg-surface mt-1"
                required
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="catBudget">Monthly Budget (₹)</Label>
              <Input 
                id="catBudget" 
                type="number"
                value={budget} 
                onChange={e => setBudget(e.target.value)} 
                placeholder="5000" 
                className="bg-surface mt-1"
                required
                disabled={isPending}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Saving...' : 'Create Budget'}
            </Button>
          </form>
        </section>
      </div>
    </div>
  )
}
