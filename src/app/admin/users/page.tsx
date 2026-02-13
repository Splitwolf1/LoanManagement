'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Users, Shield, Ban, CheckCircle, Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface User {
    id: string
    name: string | null
    email: string
    role: 'ADMIN' | 'VOLUNTEER'
    isBanned: boolean
    bannedAt: string | null
    bannedBy: string | null
    banReason: string | null
    createdAt: string
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    // Dialog states
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [showRoleDialog, setShowRoleDialog] = useState(false)
    const [showBanDialog, setShowBanDialog] = useState(false)
    const [showUnbanDialog, setShowUnbanDialog] = useState(false)

    // Form states
    const [newRole, setNewRole] = useState<'ADMIN' | 'VOLUNTEER'>('VOLUNTEER')
    const [banReason, setBanReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [])

    useEffect(() => {
        const filtered = users.filter(user =>
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setFilteredUsers(filtered)
    }, [searchQuery, users])

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users')
            const data = await response.json()
            setUsers(data.users || [])
            setFilteredUsers(data.users || [])
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateRole = async () => {
        if (!selectedUser) return
        setIsSubmitting(true)

        try {
            const response = await fetch(`/api/admin/users/${selectedUser.id}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            })

            if (response.ok) {
                await fetchUsers()
                setShowRoleDialog(false)
                setSelectedUser(null)
            }
        } catch (error) {
            console.error('Error updating role:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBanUser = async () => {
        if (!selectedUser || !banReason.trim()) return
        setIsSubmitting(true)

        try {
            const response = await fetch(`/api/admin/users/${selectedUser.id}/ban`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: banReason }),
            })

            if (response.ok) {
                await fetchUsers()
                setShowBanDialog(false)
                setSelectedUser(null)
                setBanReason('')
            }
        } catch (error) {
            console.error('Error banning user:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUnbanUser = async () => {
        if (!selectedUser) return
        setIsSubmitting(true)

        try {
            const response = await fetch(`/api/admin/users/${selectedUser.id}/unban`, {
                method: 'PUT',
            })

            if (response.ok) {
                await fetchUsers()
                setShowUnbanDialog(false)
                setSelectedUser(null)
            }
        } catch (error) {
            console.error('Error unbanning user:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const getRoleBadge = (role: string) => {
        return role === 'ADMIN' ? (
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                <Shield className="w-3 h-3 mr-1" />
                Admin
            </Badge>
        ) : (
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Volunteer
            </Badge>
        )
    }

    const getStatusBadge = (isBanned: boolean) => {
        return isBanned ? (
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <Ban className="w-3 h-3 mr-1" />
                Banned
            </Badge>
        ) : (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
            </Badge>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-success/10">
            {/* Header */}
            <div className="bg-card/50 backdrop-blur-lg border-b border-border/50 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/dashboard">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <Users className="w-6 h-6 text-accent" />
                                    User Management
                                </h1>
                                <p className="text-sm text-muted-foreground">Manage user roles and permissions</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>All Users</CardTitle>
                                <CardDescription>View and manage all users in the system</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 w-64"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent"></div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                                            <TableCell>{getStatusBadge(user.isBanned)}</TableCell>
                                            <TableCell>{format(new Date(user.createdAt), 'MMM dd, yyyy')}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedUser(user)
                                                            setNewRole(user.role)
                                                            setShowRoleDialog(true)
                                                        }}
                                                    >
                                                        Change Role
                                                    </Button>
                                                    {user.isBanned ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-green-600"
                                                            onClick={() => {
                                                                setSelectedUser(user)
                                                                setShowUnbanDialog(true)
                                                            }}
                                                        >
                                                            Unban
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600"
                                                            onClick={() => {
                                                                setSelectedUser(user)
                                                                setShowBanDialog(true)
                                                            }}
                                                        >
                                                            Ban
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Change Role Dialog */}
            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                        <DialogDescription>
                            Update the role for {selectedUser?.name || selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="role">Role</Label>
                        <Select value={newRole} onValueChange={(value: 'ADMIN' | 'VOLUNTEER') => setNewRole(value)}>
                            <SelectTrigger className="mt-2">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateRole} disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'Update Role'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Ban User Dialog */}
            <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ban User</DialogTitle>
                        <DialogDescription>
                            Ban {selectedUser?.name || selectedUser?.email} from the system
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="banReason">Reason for ban *</Label>
                        <Input
                            id="banReason"
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            placeholder="Enter reason for banning this user"
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBanDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBanUser}
                            disabled={isSubmitting || !banReason.trim()}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isSubmitting ? 'Banning...' : 'Ban User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Unban User Dialog */}
            <Dialog open={showUnbanDialog} onOpenChange={setShowUnbanDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unban User</DialogTitle>
                        <DialogDescription>
                            Restore access for {selectedUser?.name || selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser?.banReason && (
                        <div className="py-4 p-4 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-1">Original ban reason:</p>
                            <p className="text-sm text-muted-foreground">{selectedUser.banReason}</p>
                            {selectedUser.bannedAt && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    Banned on {format(new Date(selectedUser.bannedAt), 'MMM dd, yyyy')}
                                </p>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUnbanDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUnbanUser}
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isSubmitting ? 'Unbanning...' : 'Unban User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
