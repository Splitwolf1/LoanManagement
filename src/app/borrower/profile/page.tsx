'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface BorrowerProfile {
    id: string
    email: string
    fullName: string
    phone?: string
    address?: string
    dateOfBirth?: string
}

export default function BorrowerProfilePage() {
    const router = useRouter()
    const [profile, setProfile] = useState<BorrowerProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        phone: '',
        address: '',
        dateOfBirth: '',
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            // In production, get email from session/auth
            const email = 'borrower@example.com' // TODO: Get from auth session

            const response = await fetch(`/api/borrower/profile?email=${encodeURIComponent(email)}`)

            if (response.ok) {
                const data = await response.json()
                setProfile(data)
                setFormData({
                    email: data.email,
                    fullName: data.fullName,
                    phone: data.phone || '',
                    address: data.address || '',
                    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
                })
            } else if (response.status === 404) {
                // Profile doesn't exist yet, set default email
                setFormData(prev => ({ ...prev, email }))
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setMessage(null)

        try {
            const method = profile ? 'PUT' : 'POST'
            const response = await fetch('/api/borrower/profile', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                const data = await response.json()
                setProfile(data)
                setMessage({ type: 'success', text: 'Profile saved successfully!' })

                // Redirect to dashboard after 1.5 seconds
                setTimeout(() => {
                    router.push('/borrower/dashboard')
                }, 1500)
            } else {
                const error = await response.json()
                setMessage({ type: 'error', text: error.error || 'Failed to save profile' })
            }
        } catch (error) {
            console.error('Error saving profile:', error)
            setMessage({ type: 'error', text: 'An error occurred while saving' })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-success/10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-success/10">
            {/* Header */}
            <div className="bg-card/50 backdrop-blur-lg border-b border-border/50 shadow-lg">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/borrower/dashboard">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold">My Profile</h1>
                                <p className="text-sm text-muted-foreground">Manage your personal information</p>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-accent" />
                            Personal Information
                        </CardTitle>
                        <CardDescription>
                            Update your profile details. This information will be displayed on your dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email */}
                            <div>
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled
                                    className="mt-1.5 bg-muted"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                            </div>

                            {/* Full Name */}
                            <div>
                                <Label htmlFor="fullName" className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    Full Name *
                                </Label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                    placeholder="Enter your full name"
                                    className="mt-1.5"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <Label htmlFor="phone" className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="(555) 123-4567"
                                    className="mt-1.5"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <Label htmlFor="address" className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    Address
                                </Label>
                                <Input
                                    id="address"
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="123 Main St, City, State, ZIP"
                                    className="mt-1.5"
                                />
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    Date of Birth
                                </Label>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    className="mt-1.5"
                                />
                            </div>

                            {/* Message */}
                            {message && (
                                <div className={`p-4 rounded-lg ${message.type === 'success'
                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-gradient-to-r from-accent to-success text-white gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSaving ? 'Saving...' : 'Save Profile'}
                                </Button>
                                <Link href="/borrower/dashboard">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
