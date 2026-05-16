'use client'

import { useSpaceStore } from '@/store/useSpaceStore'
import { useSpaces, useCategories, useExpenses, useProfile, useSpaceMembers } from '@/hooks/useQueries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { User, ChevronDown, TrendingDown, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const { activeSpaceId, setActiveSpace } = useSpaceStore()
  const { data: spaces, isLoading: loadingSpaces } = useSpaces()
  const { data: categories, isLoading: loadingCategories } = useCategories(activeSpaceId || '')
  const { data: expenses, isLoading: loadingExpenses } = useExpenses(activeSpaceId || '')
  const { data: profile } = useProfile()
  const { data: members } = useSpaceMembers(activeSpaceId || '')
  
  if (loadingSpaces) return <div className="p-6 pt-12 text-center text-muted-foreground">Loading dashboard...</div>

  const activeSpace = spaces?.find(s => s.id === activeSpaceId)

  // If there are spaces but no active space selected, default to the first one
  if (!activeSpace && spaces && spaces.length > 0) {
    setActiveSpace(spaces[0].id)
  }

  const totalBudget = categories?.reduce((acc, cat) => acc + Number(cat.budget), 0) || 0
  const totalSpent = categories?.reduce((acc, cat) => acc + Number(cat.spent), 0) || 0
  const remaining = totalBudget - totalSpent
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

  // Compute month over month
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  let currentMonthSpent = 0
  let lastMonthSpent = 0
  const userSpendMap: Record<string, number> = {}

  if (expenses) {
    expenses.forEach(exp => {
      const date = new Date(exp.created_at)
      const m = date.getMonth()
      const y = date.getFullYear()
      const amt = Number(exp.amount) || 0

      if (m === currentMonth && y === currentYear) {
        currentMonthSpent += amt
        // individual spending
        const payer = exp.paid_by as string
        userSpendMap[payer] = (userSpendMap[payer] || 0) + amt
      } else if (m === lastMonth && y === lastMonthYear) {
        lastMonthSpent += amt
      }
    })
  }

  // Calculate MoM difference
  let momDiff = 0
  let momText = ''
  let isBetter = true

  if (lastMonthSpent === 0) {
    if (currentMonthSpent > 0) {
      momText = 'First month of tracking!'
    }
  } else {
    momDiff = Math.round(((currentMonthSpent - lastMonthSpent) / lastMonthSpent) * 100)
    isBetter = momDiff <= 0
    momText = `${Math.abs(momDiff)}% ${isBetter ? 'less' : 'more'} than last month`
  }

  // Helper to get real name
  const getUserName = (userId: string) => {
    if (profile && profile.id === userId) return 'You'
    const member: any = members?.find((m: any) => m.user_id === userId)
    const p = member?.profiles
    const name = Array.isArray(p) ? p[0]?.name : p?.name
    return name || `User ${userId.substring(0, 4)}`
  }

  return (
    <div className="p-6 pt-12 pb-24">
      <header className="mb-8 flex justify-between items-start">
        <div className="w-full relative group">
          <div className="flex items-center gap-2 cursor-pointer">
            <select 
              className="appearance-none bg-transparent text-3xl font-bold text-primary focus:outline-none pr-8 cursor-pointer relative z-10"
              value={activeSpaceId || ''}
              onChange={(e) => setActiveSpace(e.target.value)}
            >
              {spaces?.length === 0 && <option value="">No Spaces Found</option>}
              {spaces?.map(space => (
                <option key={space.id} value={space.id} className="text-base text-foreground bg-surface">
                  {space.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-6 h-6 text-primary absolute left-[calc(100%-2rem)] -z-0 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-muted-foreground text-sm mt-1">Overview Metrics</p>
        </div>
        <Link href="/dashboard/settings" className="p-2 bg-surface rounded-full text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
          <User className="w-6 h-6" />
        </Link>
      </header>

      {(!spaces || spaces.length === 0) ? (
        <div className="text-center mt-20">
          <p className="text-muted-foreground mb-4">You don't have any spaces yet.</p>
          <Link href="/dashboard/spaces" className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium">
            Manage Spaces
          </Link>
        </div>
      ) : (
        <>
          {momText && (
            <div className={`mb-6 p-3 rounded-lg flex items-center gap-3 text-sm font-medium ${isBetter ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {isBetter ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
              <span>{momText}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="bg-surface border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${spendTextColor(spendPercentage)}`}>₹{remaining.toLocaleString()}</div>
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
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">Overall Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-4 w-full bg-background rounded-full overflow-hidden mb-2 relative">
                <div
                  className={`h-full ${spendBarColor(spendPercentage)} transition-all duration-1000 ease-out`}
                  style={{ width: `${spendPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{spendPercentage}% Spent</span>
                <span>₹{remaining.toLocaleString()} Remaining</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center mb-4 mt-8">
            <h2 className="text-xl font-semibold text-foreground">Individual Spending (This Month)</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            {Object.entries(userSpendMap).map(([userId, amount]) => {
              const displayName = getUserName(userId)
              
              return (
                <Card key={userId} className="bg-surface border-none shadow-sm">
                  <CardContent className="p-4 flex justify-between items-center">
                    <span className="font-medium text-foreground">{displayName}</span>
                    <span className="font-semibold text-primary">₹{amount.toLocaleString()}</span>
                  </CardContent>
                </Card>
              )
            })}
            {Object.keys(userSpendMap).length === 0 && (
               <p className="text-muted-foreground text-sm col-span-2">No expenses yet this month.</p>
            )}
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground">Budget Breakdown</h2>
          </div>
          
          {loadingCategories ? (
            <p className="text-muted-foreground text-sm">Loading budgets...</p>
          ) : (
            <div className="space-y-4">
              {categories?.map(cat => {
                const catPercentage = cat.budget > 0 ? Math.min(100, Math.round((cat.spent / cat.budget) * 100)) : 0;
                return (
                  <div key={cat.id} className="bg-surface rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-foreground">{cat.name}</span>
                      <span className={`text-sm font-semibold ${spendTextColor(catPercentage)}`}>
                        ₹{(cat.budget - cat.spent).toLocaleString()} left
                      </span>
                    </div>
                    <div className="h-2 w-full bg-background rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full ${spendBarColor(catPercentage)} transition-all duration-500`}
                        style={{ width: `${catPercentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      ₹{cat.spent.toLocaleString()} / ₹{cat.budget.toLocaleString()}
                    </div>
                  </div>
                )
              })}
              {(!categories || categories.length === 0) && (
                <p className="text-muted-foreground text-center py-8">No categories yet. Set up budgets in space settings.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
