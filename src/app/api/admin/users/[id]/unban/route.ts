import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const user = await prisma.user.update({
            where: { id: params.id },
            data: {
                isBanned: false,
                bannedAt: null,
                bannedBy: null,
                banReason: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isBanned: true,
            },
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error unbanning user:', error)
        return NextResponse.json(
            { error: 'Failed to unban user' },
            { status: 500 }
        )
    }
}
