'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Sparkles, ArrowRight, Mail, Lock, User, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { gsap } from 'gsap'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Create the user
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to create account')
        setIsLoading(false)
        return
      }

      // Auto sign in after successful registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Account created but login failed - redirect to login
        router.push('/admin/login')
        return
      }

      // Smooth exit animation before navigation
      gsap.to(cardRef.current, {
        scale: 0.95,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => router.push('/admin/dashboard')
      })
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
      </div>

      <Card ref={cardRef} className="w-full max-w-md border-border/50 shadow-2xl backdrop-blur-xl bg-card/95">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto mb-2 p-3 rounded-2xl bg-gradient-to-br from-primary to-accent w-fit">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Join Toronto Impact
          </CardTitle>
          <CardDescription className="text-base">
            Create an account to manage community loans
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSignup}>
          <CardContent className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 border-border/50 focus:border-primary transition-all duration-300"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-border/50 focus:border-primary transition-all duration-300"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-border/50 focus:border-primary transition-all duration-300"
                required
                minLength={6}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 text-white font-medium group"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/admin/login"
                className="text-primary hover:text-primary/80 font-semibold transition-colors inline-flex items-center gap-1 group"
              >
                Sign in
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}