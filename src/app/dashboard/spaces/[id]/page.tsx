'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSpaces, useCategories, useCreateCategory, useUpdateSpace } from '@/hooks/useQueries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Copy, Check, Plus, X, Pencil, Share2 } from 'lucide-react'

export default function SpaceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data: spaces, isLoading: loadingSpaces } = useSpaces()
  const { data: categories, isLoading: loadingCategories } = useCategories(id)
  const { mutate: createCategory, isPending } = useCreateCategory()
  const { mutate: updateSpace, isPending: isUpdating } = useUpdateSpace()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [catName, setCatName] = useState('')
  const [catBudget, setCatBudget] = useState('')
  const [editName, setEditName] = useState('')
  const [copied, setCopied] = useState(false)

  const space = spaces?.find(s => s.id === id)

  const totalBudget = categories?.reduce((acc, c) => acc + Number(c.budget), 0) || 0
  const totalSpent = categories?.reduce((acc, c) => acc + Number(c.spent), 0) || 0
  const spendPercentage = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0

  function spendTextColor(pct: number) {
    if (pct >= 90) return 'text-red-500'
    if (pct >= 75) return 'text-orange-400'
    if (pct >= 50) return 'text-yellow-400'
    return 'text-green-400'
  }
  function spendBarColor(pct: number) {
    if (pct >= 90) return 'bg-red-500'
    if (pct >= 75) return 'bg-orange-400'
    if (pct >= 50) return 'bg-yellow-400'
    return 'bg-green-500'
  }

  const handleCopyCode = () => {
    if (!space) return
    navigator.clipboard.writeText(space.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    if (!space) return
    if (navigator.share) {
      navigator.share({ title: space.name, text: `Join my space on Xpens with code: ${space.invite_code}` })
    } else {
      handleCopyCode()
    }
  }

  const handleEditOpen = () => {
    if (!space) return
    setEditName(space.name)
    setShowEditModal(true)
  }

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim()) return
    updateSpace({ spaceId: id, name: editName.trim() }, {
      onSuccess: () => setShowEditModal(false)
    })
  }

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName || !catBudget) return
    createCategory(
      { spaceId: id, name: catName, budget: Number(catBudget) },
      {
        onSuccess: () => {
          setShowAddModal(false)
          setCatName('')
          setCatBudget('')
        }
      }
    )
  }

  if (loadingSpaces) {
    return <div className="p-6 pt-12 text-center text-muted-foreground">Loading...</div>
  }

  if (!space) {
    return (
      <div className="p-6 pt-12 text-center">
        <p className="text-muted-foreground mb-4">Space not found.</p>
        <Button onClick={() => router.push('/dashboard/spaces')}>Back to Spaces</Button>
      </div>
    )
  }

  return (
    <div className="p-6 pt-12 pb-24">
      <header className="mb-8 flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard/spaces')}
          className="p-2 bg-surface rounded-full text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-primary truncate">{space.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="font-mono tracking-widest">{space.invite_code}</span>
              {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleShare}
              className="p-1 text-muted-foreground hover:text-primary transition-colors"
              title="Share invite code"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <button
          onClick={handleEditOpen}
          className="p-2 bg-surface rounded-full text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
          title="Edit space name"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card className="bg-surface border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${spendTextColor(spendPercentage)}`}>₹{(totalBudget - totalSpent).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-surface border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${spendTextColor(spendPercentage)}`}>₹{totalSpent.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-surface border-none shadow-md mb-8">
        <CardContent className="pt-4">
          <div className="h-3 w-full bg-background rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-700 ${spendBarColor(spendPercentage)}`}
              style={{ width: `${spendPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{spendPercentage}% spent</span>
            <span>₹{(totalBudget - totalSpent).toLocaleString()} remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Budgets */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-foreground">Budgets</h2>
        <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Budget
        </Button>
      </div>

      {loadingCategories ? (
        <p className="text-muted-foreground text-sm text-center py-8">Loading budgets...</p>
      ) : (
        <div className="space-y-4">
          {categories?.map(cat => {
            const pct = cat.budget > 0 ? Math.min(100, Math.round((cat.spent / cat.budget) * 100)) : 0
            return (
              <div key={cat.id} className="bg-surface rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-foreground">{cat.name}</span>
                  <span className={`text-sm font-semibold ${spendTextColor(pct)}`}>
                    ₹{(cat.budget - cat.spent).toLocaleString()} left
                  </span>
                </div>
                <div className="h-2 w-full bg-background rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full transition-all duration-500 ${spendBarColor(pct)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  ₹{cat.spent.toLocaleString()} / ₹{cat.budget.toLocaleString()}
                </div>
              </div>
            )
          })}
          {(!categories || categories.length === 0) && (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
              <p className="text-muted-foreground text-sm">No budgets yet. Add one above.</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Space Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-background rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
              <h2 className="font-semibold text-lg">Edit Space</h2>
              <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleEditSave} className="space-y-4">
                <div>
                  <Label htmlFor="editName">Space Name</Label>
                  <Input
                    id="editName"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="bg-surface mt-1"
                    disabled={isUpdating}
                    autoFocus
                  />
                </div>
                <div className="pt-2 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isUpdating || !editName.trim()}>
                    {isUpdating ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Budget Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-background rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
              <h2 className="font-semibold text-lg">Add Budget</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <Label htmlFor="catName">Category Name</Label>
                  <Input
                    id="catName"
                    value={catName}
                    onChange={e => setCatName(e.target.value)}
                    placeholder="e.g. Food & Drinks"
                    className="bg-surface mt-1"
                    disabled={isPending}
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="catBudget">Budget (₹)</Label>
                  <Input
                    id="catBudget"
                    type="number"
                    min="1"
                    value={catBudget}
                    onChange={e => setCatBudget(e.target.value)}
                    placeholder="e.g. 5000"
                    className="bg-surface mt-1"
                    disabled={isPending}
                  />
                </div>
                <div className="pt-2 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isPending || !catName || !catBudget}>
                    {isPending ? 'Adding...' : 'Add'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
