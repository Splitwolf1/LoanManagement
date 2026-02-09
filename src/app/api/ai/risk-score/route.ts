import { NextRequest, NextResponse } from 'next/server'
import { calculateRiskScore } from '@/lib/ai'
import { z } from 'zod'

const RiskScoreRequestSchema = z.object({
    fullName: z.string().min(1),
    monthlyIncome: z.number().positive(),
    loanAmount: z.number().positive(),
    loanPurpose: z.string().min(1),
    employmentStatus: z.string().min(1),
    address: z.string().optional(),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = RiskScoreRequestSchema.parse(body)

        const riskScore = await calculateRiskScore(validatedData)

        return NextResponse.json(riskScore)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Error calculating risk score:', error)
        return NextResponse.json(
            { error: 'Failed to calculate risk score' },
            { status: 500 }
        )
    }
}
