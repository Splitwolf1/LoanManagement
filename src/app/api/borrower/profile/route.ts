import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const BorrowerProfileSchema = z.object({
    email: z.string().email('Invalid email address'),
    fullName: z.string().min(1, 'Full name is required'),
    phone: z.string().optional(),
    address: z.string().optional(),
    dateOfBirth: z.string().optional(),
})

// GET - Fetch borrower profile by email
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get('email')

        if (!email) {
            return NextResponse.json(
                { error: 'Email parameter is required' },
                { status: 400 }
            )
        }

        const profile = await prisma.borrowerProfile.findUnique({
            where: { email },
        })

        if (!profile) {
            return NextResponse.json(
                { error: 'Profile not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(profile)
    } catch (error) {
        console.error('Error fetching borrower profile:', error)
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        )
    }
}

// POST - Create new borrower profile
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = BorrowerProfileSchema.parse(body)

        // Check if profile already exists
        const existingProfile = await prisma.borrowerProfile.findUnique({
            where: { email: validatedData.email },
        })

        if (existingProfile) {
            return NextResponse.json(
                { error: 'Profile already exists for this email' },
                { status: 409 }
            )
        }

        const profile = await prisma.borrowerProfile.create({
            data: {
                email: validatedData.email,
                fullName: validatedData.fullName,
                phone: validatedData.phone,
                address: validatedData.address,
                dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
            },
        })

        return NextResponse.json(profile, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Error creating borrower profile:', error)
        return NextResponse.json(
            { error: 'Failed to create profile' },
            { status: 500 }
        )
    }
}

// PUT - Update existing borrower profile
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = BorrowerProfileSchema.parse(body)

        const profile = await prisma.borrowerProfile.update({
            where: { email: validatedData.email },
            data: {
                fullName: validatedData.fullName,
                phone: validatedData.phone,
                address: validatedData.address,
                dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
            },
        })

        return NextResponse.json(profile)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Error updating borrower profile:', error)
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        )
    }
}
