import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const SignupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = SignupSchema.parse(body)

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 12)

        // Create user
        const user = await prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                password: hashedPassword,
                role: 'VOLUNTEER', // Default role for new signups
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        })

        return NextResponse.json(user, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            )
        }

        // Detailed error logging
        console.error('=== Signup Error ===')
        console.error('Error type:', error?.constructor?.name)
        console.error('Error message:', error instanceof Error ? error.message : String(error))
        console.error('Full error:', error)
        console.error('DATABASE_URL exists:', !!process.env.DATABASE_URL)
        console.error('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 20) + '...')

        return NextResponse.json(
            {
                error: 'Failed to create user',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
