'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { User, ArrowRight, Mail, Lock, Shield, CheckCircle2, Wallet } from 'lucide-react'
import { gsap } from 'gsap'

export default function BorrowerLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Animated background orbs
      gsap.to('.orb', {
        y: '+=30',
        x: '+=20',
        rotation: 360,
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: {
          each: 2,
          from: 'random'
        }
      })

      // Main entrance animation
      tl.from(logoRef.current, {
        scale: 0,
        rotation: -180,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.7)'
      })
      .from(cardRef.current, {
        y: 100,
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
      }, '-=0.3')
      .from('.form-element', {
        x: -30,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1
      }, '-=0.2')
      .from('.feature-pill', {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        stagger: 0.1,
        ease: 'back.out(2)'
      }, '-=0.3')

    }, containerRef)

    return () => ctx.revert()
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // Smooth exit animation before navigation
    const tl = gsap.timeline({
      onComplete: () => router.push('/borrower/dashboard')
    })

    tl.to(cardRef.current, {
      scale: 0.95,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in'
    })

    if (email && password) {
      tl.play()
    }
  }

  return (
    <div ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-accent/5 to-success/10 p-4">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb absolute top-20 left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl"></div>
        <div className="orb absolute bottom-20 right-20 w-96 h-96 bg-success/20 rounded-full blur-3xl"></div>
        <div className="orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      {/* Floating grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding & Features */}
        <div className="hidden md:block space-y-8">
          <div ref={logoRef} className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-sm">
              <User className="w-5 h-5 text-accent animate-pulse" />
              <span className="text-sm font-medium text-accent">Borrower Portal</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="text-gradient-success">Manage Your</span>
              <br />
              <span className="text-foreground">Loan Journey</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-lg">
              Track payments, view loan status, and manage your financial commitments all in one place.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            <div className="feature-pill flex items-center gap-3 p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-success/50 transition-all duration-300 hover:scale-105">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Track Your Loans</h3>
                <p className="text-xs text-muted-foreground">Monitor all your loan details in real-time</p>
              </div>
            </div>

            <div className="feature-pill flex items-center gap-3 p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-accent/50 transition-all duration-300 hover:scale-105">
              <div className="p-2 rounded-lg bg-accent/10">
                <Wallet className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Easy Payments</h3>
                <p className="text-xs text-muted-foreground">View payment history and upcoming dues</p>
              </div>
            </div>

            <div className="feature-pill flex items-center gap-3 p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Secure & Private</h3>
                <p className="text-xs text-muted-foreground">Your data is encrypted and protected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Card */}
        <div className="flex items-center justify-center">
          <Card ref={cardRef} className="w-full max-w-md border-border/50 shadow-2xl backdrop-blur-xl bg-card/95">
            <CardHeader className="text-center space-y-2 pb-6">
              <div className="mx-auto mb-2 p-3 rounded-2xl bg-gradient-to-br from-accent to-success w-fit">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold">
                Borrower Login
              </CardTitle>
              <CardDescription className="text-base">
                Access your loan dashboard and manage payments
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleLogin}>
              <CardContent className="space-y-5">
                <div className="form-element space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-accent" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 border-border/50 focus:border-accent transition-all duration-300"
                    required
                  />
                </div>

                <div className="form-element space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-accent" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 border-border/50 focus:border-accent transition-all duration-300"
                    required
                  />
                </div>

                <div className="form-element flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border/50 text-accent focus:ring-accent" />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                  <Link href="#" className="text-accent hover:text-accent/80 font-medium transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-2">
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-accent to-success hover:opacity-90 transition-all duration-300 text-white font-medium group"
                >
                  Access Portal
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="form-element relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <p className="form-element text-sm text-center text-muted-foreground">
                  Need a loan?{' '}
                  <Link
                    href="/borrower/apply"
                    className="text-accent hover:text-accent/80 font-semibold transition-colors inline-flex items-center gap-1 group"
                  >
                    Apply now
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </p>

                <p className="form-element text-sm text-center text-muted-foreground">
                  Admin user?{' '}
                  <Link
                    href="/admin/login"
                    className="text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    Login here
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      {/* Mobile branding */}
      <div className="md:hidden absolute top-8 left-1/2 -translate-x-1/2 z-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-sm">
          <User className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-accent">Borrower Portal</span>
        </div>
      </div>
    </div>
  )
}
