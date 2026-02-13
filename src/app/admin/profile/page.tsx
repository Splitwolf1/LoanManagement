'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Shield, ArrowLeft, Save, Lock } from 'lucide-react'
import Link from 'next/link'

export default function AdminProfilePage() {
    const { data: session } = useSession()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
    })

    useEffect(() => {
        if (session?.user) {
            setFormData({
                name: session.user.name || '',
                email: session.user.email || '',
            })
        }
    }, [session])

    const handleSave = async () => {
        setIsSaving(true)
        setMessage(null)

        try {
            // TODO: Implement profile update API
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
            setIsEditing(false)
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile' })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-success/10">
            {/* Header */}
            <div className="bg-card/50 backdrop-blur-lg border-b border-border/50 shadow-lg">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/dashboard">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold">Admin Profile</h1>
                                <p className="text-sm text-muted-foreground">Manage your account settings</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Profile Information */}
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-accent" />
                            Personal Information
                        </CardTitle>
                        <CardDescription>View and update your profile details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Name */}
                        <div>
                            <Label htmlFor="name" className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={!isEditing}
                                className="mt-1.5"
                            />
                        </div>

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
                                disabled
                                className="mt-1.5 bg-muted"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                        </div>

                        {/* Role */}
                        <div>
                            <Label className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-muted-foreground" />
                                Role
                            </Label>
                            <div className="mt-1.5">
                                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                    <Shield className="w-3 h-3 mr-1" />
                                    {session?.user?.role || 'VOLUNTEER'}
                                </Badge>
                            </div>
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

                        {/* Actions */}
                        <div className="flex gap-3">
                            {isEditing ? (
                                <>
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="bg-gradient-to-r from-accent to-success text-white gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditing(false)
                                            setFormData({
                                                name: session?.user?.name || '',
                                                email: session?.user?.email || '',
                                            })
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-gradient-to-r from-accent to-success text-white"
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-accent" />
                            Security
                        </CardTitle>
                        <CardDescription>Manage your account security settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="gap-2">
                            <Lock className="w-4 h-4" />
                            Change Password
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
