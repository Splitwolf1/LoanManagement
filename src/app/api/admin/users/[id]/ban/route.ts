import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'

const BanUserSchema = z.object({
    reason: z.string().min(1, 'Ban reason is required'),
})

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { reason } = BanUserSchema.parse(body)

        const user = await prisma.user.update({
            where: { id: params.id },
            data: {
                isBanned: true,
                bannedAt: new Date(),
                bannedBy: session.user.id,
                banReason: reason,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isBanned: true,
                bannedAt: true,
                bannedBy: true,
                banReason: true,
            },
        })

        return NextResponse.json(user)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Error banning user:', error)
        return NextResponse.json(
            { error: 'Failed to ban user' },
            { status: 500 }
        )
    }
}
