import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

const ForgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = ForgotPasswordSchema.parse(body)

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        })

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({
                message: 'If an account exists, a password reset link has been sent.',
            })
        }

        // Delete any existing tokens for this email
        await prisma.passwordResetToken.deleteMany({
            where: { email },
        })

        // Generate a secure token
        const token = crypto.randomBytes(32).toString('hex')
        const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        // Save the token
        await prisma.passwordResetToken.create({
            data: {
                email,
                token,
                expires,
            },
        })

        // Send the reset email
        const resetUrl = `${process.env.NEXTAUTH_URL}/admin/reset-password?token=${token}`
        await sendPasswordResetEmail(email, user.name || 'User', resetUrl)

        return NextResponse.json({
            message: 'If an account exists, a password reset link has been sent.',
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            )
        }

        console.error('Forgot password error:', error)
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        )
    }
}
