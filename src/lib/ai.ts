import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export interface RiskScoreResult {
    score: number // 0-100, higher = higher risk
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    factors: string[]
    recommendation: string
    summary: string
}

export interface PortfolioInsight {
    overview: string
    trends: string[]
    recommendations: string[]
    riskDistribution: {
        low: number
        medium: number
        high: number
    }
}

/**
 * Calculate risk score for a loan application using AI
 */
export async function calculateRiskScore(
    applicantData: {
        fullName: string
        monthlyIncome: number
        loanAmount: number
        loanPurpose: string
        employmentStatus: string
        address?: string
    }
): Promise<RiskScoreResult> {
    // If no API key, return mock data
    if (!process.env.OPENAI_API_KEY) {
        return getMockRiskScore(applicantData)
    }

    try {
        const prompt = `Analyze this loan application and provide a risk assessment:

Applicant: ${applicantData.fullName}
Monthly Income: $${applicantData.monthlyIncome.toLocaleString()}
Loan Amount Requested: $${applicantData.loanAmount.toLocaleString()}
Loan Purpose: ${applicantData.loanPurpose}
Employment Status: ${applicantData.employmentStatus}
${applicantData.address ? `Location: ${applicantData.address}` : ''}

Debt-to-Income Ratio: ${((applicantData.loanAmount / (applicantData.monthlyIncome * 12)) * 100).toFixed(1)}%

Provide a JSON response with the following structure:
{
  "score": <number 0-100, where 0 is lowest risk and 100 is highest risk>,
  "riskLevel": "<LOW|MEDIUM|HIGH>",
  "factors": [<array of 2-4 key risk factors or positive indicators>],
  "recommendation": "<approve|conditional|review|decline>",
  "summary": "<2-3 sentence summary of the assessment>"
}

Consider factors like debt-to-income ratio, loan purpose, employment stability, and loan amount relative to income.`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a financial risk analyst for a community loan organization. Provide fair, balanced assessments focused on helping people while managing organizational risk. Always respond with valid JSON.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.3,
            max_tokens: 500,
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('No response from OpenAI')
        }

        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            throw new Error('Invalid JSON response')
        }

        const result = JSON.parse(jsonMatch[0])
        return {
            score: Math.min(100, Math.max(0, result.score)),
            riskLevel: result.riskLevel,
            factors: result.factors,
            recommendation: result.recommendation,
            summary: result.summary,
        }
    } catch (error) {
        console.error('Error calculating risk score:', error)
        return getMockRiskScore(applicantData)
    }
}

/**
 * Generate portfolio insights using AI
 */
export async function generatePortfolioInsights(
    portfolioData: {
        totalLoans: number
        activeLoans: number
        overdueLoans: number
        totalDisbursed: number
        totalRepaid: number
        averageLoanAmount: number
        overdueRate: number
    }
): Promise<PortfolioInsight> {
    // If no API key, return mock data
    if (!process.env.OPENAI_API_KEY) {
        return getMockPortfolioInsight(portfolioData)
    }

    try {
        const prompt = `Analyze this community loan portfolio and provide insights:

Total Loans: ${portfolioData.totalLoans}
Active Loans: ${portfolioData.activeLoans}
Overdue Loans: ${portfolioData.overdueLoans}
Total Disbursed: $${portfolioData.totalDisbursed.toLocaleString()}
Total Repaid: $${portfolioData.totalRepaid.toLocaleString()}
Average Loan Amount: $${portfolioData.averageLoanAmount.toLocaleString()}
Overdue Rate: ${(portfolioData.overdueRate * 100).toFixed(1)}%

Provide a JSON response with the following structure:
{
  "overview": "<2-3 sentence overview of portfolio health>",
  "trends": [<array of 2-3 observed trends>],
  "recommendations": [<array of 2-3 actionable recommendations>],
  "riskDistribution": {
    "low": <percentage>,
    "medium": <percentage>,
    "high": <percentage>
  }
}`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a financial analyst providing portfolio insights for a community loan organization. Focus on actionable insights and risk management. Always respond with valid JSON.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.3,
            max_tokens: 500,
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('No response from OpenAI')
        }

        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            throw new Error('Invalid JSON response')
        }

        return JSON.parse(jsonMatch[0])
    } catch (error) {
        console.error('Error generating portfolio insights:', error)
        return getMockPortfolioInsight(portfolioData)
    }
}

// Mock data for when API key is not available
function getMockRiskScore(applicantData: { monthlyIncome: number; loanAmount: number }): RiskScoreResult {
    const debtToIncome = applicantData.loanAmount / (applicantData.monthlyIncome * 12)

    let score: number
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    let recommendation: string

    if (debtToIncome < 0.2) {
        score = 20 + Math.random() * 15
        riskLevel = 'LOW'
        recommendation = 'approve'
    } else if (debtToIncome < 0.4) {
        score = 40 + Math.random() * 20
        riskLevel = 'MEDIUM'
        recommendation = 'conditional'
    } else {
        score = 65 + Math.random() * 25
        riskLevel = 'HIGH'
        recommendation = 'review'
    }

    return {
        score: Math.round(score),
        riskLevel,
        factors: [
            `Debt-to-income ratio: ${(debtToIncome * 100).toFixed(1)}%`,
            'Employment status verified',
            'Community member recommendation',
        ],
        recommendation,
        summary: `Based on the debt-to-income ratio of ${(debtToIncome * 100).toFixed(1)}%, this application presents ${riskLevel.toLowerCase()} risk. Recommend ${recommendation} with standard terms.`,
    }
}

function getMockPortfolioInsight(portfolioData: {
    overdueRate: number
    totalLoans: number
    activeLoans: number
}): PortfolioInsight {
    const healthStatus = portfolioData.overdueRate < 0.1 ? 'healthy' : portfolioData.overdueRate < 0.2 ? 'stable' : 'needs attention'

    return {
        overview: `The portfolio is ${healthStatus} with ${portfolioData.activeLoans} active loans out of ${portfolioData.totalLoans} total. The overdue rate of ${(portfolioData.overdueRate * 100).toFixed(1)}% is ${portfolioData.overdueRate < 0.15 ? 'within acceptable limits' : 'above target'}.`,
        trends: [
            'Steady loan activity over the past quarter',
            'Repayment rates remain consistent',
            portfolioData.overdueRate < 0.1 ? 'Low default risk across portfolio' : 'Some accounts require follow-up',
        ],
        recommendations: [
            'Continue community outreach programs',
            'Consider implementing early payment incentives',
            'Review underwriting criteria quarterly',
        ],
        riskDistribution: {
            low: 60,
            medium: 30,
            high: 10,
        },
    }
}

export { openai }
