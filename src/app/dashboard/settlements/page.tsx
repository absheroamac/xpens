'use client'

import { useState } from 'react'
import { useSpaceStore } from '@/store/useSpaceStore'
import { useExpenses } from '@/hooks/useQueries'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, SplitSquareHorizontal } from 'lucide-react'

type DebtRow = {
  key: string
  debtor: string
  creditor: string
  originalAmount: number
}

export default function SettlementsPage() {
  const { activeSpaceId } = useSpaceStore()
  const { data: expenses, isLoading } = useExpenses(activeSpaceId || '')

  // settled[key] = total amount already settled for that debt pair
  const [settled, setSettled] = useState<Record<string, number>>({})
  // which row has the partial input open
  const [partialOpen, setPartialOpen] = useState<string | null>(null)
  const [partialInput, setPartialInput] = useState('')

  const calculateDebts = (): DebtRow[] => {
    if (!expenses) return []

    const balances: Record<string, number> = {}

    expenses.forEach(exp => {
      const payer = exp.paid_by as string
      const splits: { user_id: string; amount: number }[] = exp.expense_splits ?? []

      splits.forEach(split => {
        if (split.user_id === payer) return
        const key = `${split.user_id}→${payer}`
        balances[key] = (balances[key] || 0) + Number(split.amount)
      })
    })

    return Object.entries(balances)
      .filter(([, amount]) => amount > 0)
      .map(([key, amount]) => {
        const [debtor, creditor] = key.split('→')
        return { key, debtor, creditor, originalAmount: amount }
      })
  }

  const debts = calculateDebts()

  const remaining = (row: DebtRow) =>
    Math.max(0, row.originalAmount - (settled[row.key] || 0))

  const handleFullSettle = (key: string, amount: number) => {
    setSettled(prev => ({ ...prev, [key]: amount }))
    setPartialOpen(null)
  }

  const handlePartialSettle = (key: string) => {
    const value = parseFloat(partialInput)
    if (isNaN(value) || value <= 0) return
    setSettled(prev => ({
      ...prev,
      [key]: Math.min(
        (prev[key] || 0) + value,
        debts.find(d => d.key === key)!.originalAmount
      )
    }))
    setPartialInput('')
    setPartialOpen(null)
  }

  const openPartial = (key: string) => {
    setPartialInput('')
    setPartialOpen(key)
  }

  if (!activeSpaceId) {
    return <div className="p-6 pt-12 text-center text-muted-foreground">Please select a space first.</div>
  }

  return (
    <div className="p-6 pt-12 pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Settlements</h1>
        <p className="text-muted-foreground text-sm mt-1">Who owes what</p>
      </header>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
        <div className="space-y-4">
          {debts.map(row => {
            const rem = remaining(row)
            const settledAmt = settled[row.key] || 0
            const isFullySettled = rem === 0
            const pct = Math.round((settledAmt / row.originalAmount) * 100)

            return (
              <Card
                key={row.key}
                className={`border-none shadow-sm transition-opacity ${isFullySettled ? 'opacity-50' : 'bg-surface'}`}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Header row */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        <span className="text-primary">{row.debtor === 'u2' ? 'User 2' : row.debtor}</span>
                        <span className="text-muted-foreground font-normal"> owes </span>
                        <span className="text-primary">{row.creditor === 'u2' ? 'User 2' : 'You'}</span>
                      </p>
                      {settledAmt > 0 && !isFullySettled && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ₹{settledAmt.toLocaleString()} settled · ₹{rem.toLocaleString()} remaining
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${isFullySettled ? 'text-green-400 line-through' : 'text-foreground'}`}>
                        ₹{rem.toLocaleString()}
                      </p>
                      {settledAmt > 0 && !isFullySettled && (
                        <p className="text-xs text-muted-foreground">of ₹{row.originalAmount.toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  {/* Progress bar — only when partially settled */}
                  {settledAmt > 0 && (
                    <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${isFullySettled ? 'bg-green-500' : 'bg-primary'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}

                  {/* Actions */}
                  {!isFullySettled && (
                    <>
                      {partialOpen === row.key ? (
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            min="1"
                            max={rem}
                            placeholder={`Max ₹${rem.toLocaleString()}`}
                            value={partialInput}
                            onChange={e => setPartialInput(e.target.value)}
                            className="bg-background flex-1 h-9 text-sm"
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') handlePartialSettle(row.key)
                              if (e.key === 'Escape') setPartialOpen(null)
                            }}
                          />
                          <Button
                            size="sm"
                            className="h-9 px-4"
                            disabled={!partialInput || parseFloat(partialInput) <= 0}
                            onClick={() => handlePartialSettle(row.key)}
                          >
                            Apply
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 px-3 text-muted-foreground"
                            onClick={() => setPartialOpen(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1.5 h-9"
                            onClick={() => openPartial(row.key)}
                          >
                            <SplitSquareHorizontal className="w-3.5 h-3.5" />
                            Partial
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 gap-1.5 h-9 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleFullSettle(row.key, row.originalAmount)}
                          >
                            <Check className="w-3.5 h-3.5" />
                            Settled
                          </Button>
                        </div>
                      )}
                    </>
                  )}

                  {isFullySettled && (
                    <p className="text-center text-xs text-green-400 font-medium py-1">Fully settled ✓</p>
                  )}
                </CardContent>
              </Card>
            )
          })}

          {debts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Everyone is settled up!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
