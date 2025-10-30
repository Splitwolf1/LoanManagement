import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CreateBorrowerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [borrowers, total] = await Promise.all([
      prisma.borrower.findMany({
        where,
        skip,
        take: limit,
        include: {
          loans: {
            select: {
              id: true,
              amount: true,
              status: true,
              issuedAt: true,
              dueDate: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.borrower.count({ where }),
    ])

    return NextResponse.json({
      borrowers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching borrowers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch borrowers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateBorrowerSchema.parse(body)

    const borrower = await prisma.borrower.create({
      data: validatedData,
      include: {
        loans: {
          select: {
            id: true,
            amount: true,
            status: true,
            issuedAt: true,
            dueDate: true,
          },
        },
      },
    })

    return NextResponse.json(borrower, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating borrower:', error)
    return NextResponse.json(
      { error: 'Failed to create borrower' },
      { status: 500 }
    )
  }
}