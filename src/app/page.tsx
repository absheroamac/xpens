import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl text-primary mb-6">
        Shared Expense Tracker
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-lg">
        The simplest way to track shared expenses, budgets, and settlements with your friends and family.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Link href="/signup" className="w-full">
          <Button size="lg" className="w-full text-lg h-14 rounded-2xl shadow-lg">
            Get Started
          </Button>
        </Link>
        <Link href="/login" className="w-full">
          <Button variant="outline" size="lg" className="w-full text-lg h-14 rounded-2xl">
            Log In
          </Button>
        </Link>
      </div>
    </div>
  )
}
