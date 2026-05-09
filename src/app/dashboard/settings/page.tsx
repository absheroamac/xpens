'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProfile, useUpdateProfile } from '@/hooks/useQueries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { logout } from '@/features/auth/actions'
import { LogOut, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useSpaceStore } from '@/store/useSpaceStore'

export default function SettingsPage() {
  const router = useRouter()
  const { data: profile, isLoading } = useProfile()
  const { mutate: updateProfile, isPending } = useUpdateProfile()
  const queryClient = useQueryClient()
  
  const [name, setName] = useState('')

  useEffect(() => {
    if (profile?.name) {
      setName(profile.name)
    }
  }, [profile])

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    updateProfile(name, {
      onSuccess: () => {
        toast.success("Profile updated successfully")
      },
      onError: (error) => {
        toast.error("Failed to update profile")
        console.error(error)
      }
    })
  }

  const handleLogout = async () => {
    useSpaceStore.persist.clearStorage()
    queryClient.clear()
    await logout()
  }

  return (
    <div className="p-6 pt-12 pb-24">
      <header className="mb-8 flex items-center gap-4">
        <Link href="/dashboard" className="p-2 bg-surface rounded-full text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-primary">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and account</p>
        </div>
      </header>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading profile...</p>
      ) : (
        <div className="space-y-6">
          <Card className="bg-surface border-none shadow-md">
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profile?.email || ''} 
                    disabled 
                    className="bg-muted text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground">Your email cannot be changed.</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter your name"
                    required
                  />
                </div>
                
                <Button type="submit" disabled={isPending || name === profile?.name} className="w-full">
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-surface border-none shadow-md border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={handleLogout}>
                <Button variant="destructive" className="w-full flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Log Out
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
