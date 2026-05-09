'use client'

import { useActionState } from 'react'
import { login } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const initialState = {
  error: '',
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md bg-surface border-none shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your email and password to log in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state?.error && (
            <div className="bg-destructive/15 text-destructive text-sm font-medium p-3 rounded-lg mb-6">
              {state.error}
            </div>
          )}
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="bg-background"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="bg-background" 
                disabled={isPending}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 text-lg rounded-xl"
              disabled={isPending}
            >
              {isPending ? 'Logging in...' : 'Log in'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
