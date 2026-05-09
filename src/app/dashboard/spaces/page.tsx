'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSpaces, useCreateSpace } from '@/hooks/useQueries'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Plus, X, Users } from 'lucide-react'
import Link from 'next/link'

export default function SpacesPage() {
  const router = useRouter()
  const { data: spaces, isLoading } = useSpaces()
  const { mutate: createSpace, isPending } = useCreateSpace()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  
  const [newSpaceName, setNewSpaceName] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  const handleCreateSpace = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSpaceName) return
    
    createSpace(newSpaceName, {
      onSuccess: (data) => {
        if (data) {
          setShowCreateModal(false)
          setNewSpaceName('')
          router.push(`/dashboard/spaces/${data.id}`)
        }
      }
    })
  }

  const handleJoinSpace = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode) return
    alert(`Joining space via code: ${inviteCode} is not implemented yet.`)
    setInviteCode('')
    setShowJoinModal(false)
  }

  return (
    <div className="p-6 pt-12 pb-24">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-primary">Spaces Directory</h1>
          <p className="text-muted-foreground">Manage your groups</p>
        </div>
        <Link href="/dashboard/settings" className="p-2 bg-surface rounded-full text-muted-foreground hover:text-primary transition-colors">
          <User className="w-6 h-6" />
        </Link>
      </header>

      <div className="flex gap-4 mb-8">
        <Button onClick={() => setShowCreateModal(true)} className="flex-1 gap-2">
          <Plus className="w-4 h-4" /> Create Space
        </Button>
        <Button variant="secondary" onClick={() => setShowJoinModal(true)} className="flex-1 gap-2">
          <Users className="w-4 h-4" /> Join Space
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm text-center py-8">Loading spaces...</p>
      ) : (
        <div className="space-y-4 mb-10">
          {spaces?.map(space => (
            <Card 
              key={space.id} 
              className="bg-surface border-border hover:border-primary transition-all cursor-pointer overflow-hidden group"
              onClick={() => router.push(`/dashboard/spaces/${space.id}`)}
            >
              <CardContent className="p-5 flex justify-between items-center relative">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="font-semibold text-lg text-foreground relative z-10">{space.name}</h3>
                <span className="text-muted-foreground text-xs font-mono relative z-10 opacity-50 group-hover:opacity-100 transition-opacity">
                  Code: {space.invite_code}
                </span>
              </CardContent>
            </Card>
          ))}
          {(!spaces || spaces.length === 0) && (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
              <p className="text-muted-foreground text-sm">No spaces found. Create or join one above.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-background rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
              <h2 className="font-semibold text-lg">Create New Space</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateSpace} className="space-y-4">
                <div>
                  <Label htmlFor="spaceName">Space Name</Label>
                  <Input 
                    id="spaceName" 
                    value={newSpaceName} 
                    onChange={e => setNewSpaceName(e.target.value)} 
                    placeholder="e.g. Goa Trip 2026" 
                    className="bg-surface mt-1"
                    disabled={isPending}
                    autoFocus
                  />
                </div>
                <div className="pt-2 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1" disabled={isPending || !newSpaceName}>
                    {isPending ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowJoinModal(false)}>
          <div className="bg-background rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
              <h2 className="font-semibold text-lg">Join a Space</h2>
              <button onClick={() => setShowJoinModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleJoinSpace} className="space-y-4">
                <div>
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input 
                    id="inviteCode" 
                    value={inviteCode} 
                    onChange={e => setInviteCode(e.target.value)} 
                    placeholder="Enter 6-character code" 
                    className="bg-surface mt-1 font-mono uppercase text-center tracking-widest text-lg"
                    maxLength={6}
                    autoFocus
                  />
                </div>
                <div className="pt-2 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowJoinModal(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1" disabled={!inviteCode || inviteCode.length < 6}>
                    Join
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
