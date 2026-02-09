import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Email templates
const templates = {
    applicationReceived: (name: string, loanAmount: number) => ({
        subject: 'Loan Application Received - Toronto Impact Initiative',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Toronto Impact Initiative</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Loan Management System</p>
        </div>
        <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0;">Application Received!</h2>
          <p style="color: #475569; line-height: 1.6;">Dear ${name},</p>
          <p style="color: #475569; line-height: 1.6;">
            Thank you for submitting your loan application for <strong>$${loanAmount.toLocaleString()}</strong>. 
            We have received your application and our team will review it shortly.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
            <p style="margin: 0; color: #1e293b;"><strong>What happens next?</strong></p>
            <ul style="color: #475569; margin: 10px 0 0 0; padding-left: 20px;">
              <li>Our team will review your application within 2-3 business days</li>
              <li>We may reach out for additional documents if needed</li>
              <li>You'll receive an email once a decision is made</li>
            </ul>
          </div>
          <p style="color: #475569; line-height: 1.6;">
            If you have any questions, please don't hesitate to contact us.
          </p>
          <p style="color: #475569; line-height: 1.6; margin-top: 30px;">
            Best regards,<br/>
            <strong>Toronto Impact Initiative Team</strong>
          </p>
        </div>
      </div>
    `,
    }),

    applicationApproved: (name: string, loanAmount: number, conditions?: string) => ({
        subject: 'Congratulations! Your Loan Has Been Approved - Toronto Impact Initiative',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Congratulations!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your loan has been approved</p>
        </div>
        <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #475569; line-height: 1.6;">Dear ${name},</p>
          <p style="color: #475569; line-height: 1.6;">
            We're pleased to inform you that your loan application for <strong>$${loanAmount.toLocaleString()}</strong> has been approved!
          </p>
          ${conditions ? `
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>Conditions:</strong></p>
            <p style="margin: 10px 0 0 0; color: #92400e;">${conditions}</p>
          </div>
          ` : ''}
          <p style="color: #475569; line-height: 1.6;">
            Our team will be in touch shortly to discuss the next steps and finalize the disbursement.
          </p>
          <p style="color: #475569; line-height: 1.6; margin-top: 30px;">
            Best regards,<br/>
            <strong>Toronto Impact Initiative Team</strong>
          </p>
        </div>
      </div>
    `,
    }),

    applicationRejected: (name: string, reason?: string) => ({
        subject: 'Loan Application Update - Toronto Impact Initiative',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Toronto Impact Initiative</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Loan Application Update</p>
        </div>
        <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #475569; line-height: 1.6;">Dear ${name},</p>
          <p style="color: #475569; line-height: 1.6;">
            Thank you for your interest in our loan program. After careful review, we regret to inform you that 
            we are unable to approve your application at this time.
          </p>
          ${reason ? `
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #64748b; margin: 20px 0;">
            <p style="margin: 0; color: #1e293b;"><strong>Reason:</strong></p>
            <p style="margin: 10px 0 0 0; color: #475569;">${reason}</p>
          </div>
          ` : ''}
          <p style="color: #475569; line-height: 1.6;">
            This decision does not prevent you from applying again in the future. We encourage you to reach out 
            if you'd like guidance on strengthening your next application.
          </p>
          <p style="color: #475569; line-height: 1.6; margin-top: 30px;">
            Best regards,<br/>
            <strong>Toronto Impact Initiative Team</strong>
          </p>
        </div>
      </div>
    `,
    }),

    paymentReminder: (name: string, loanAmount: number, dueDate: string, amountDue: number) => ({
        subject: 'Payment Reminder - Toronto Impact Initiative',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #eab308 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Payment Reminder</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your payment is coming up</p>
        </div>
        <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #475569; line-height: 1.6;">Dear ${name},</p>
          <p style="color: #475569; line-height: 1.6;">
            This is a friendly reminder that a payment of <strong>$${amountDue.toLocaleString()}</strong> 
            is due on <strong>${dueDate}</strong>.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
            <table style="width: 100%;">
              <tr>
                <td style="color: #64748b; padding: 5px 0;">Loan Amount:</td>
                <td style="color: #1e293b; font-weight: bold; text-align: right;">$${loanAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 5px 0;">Due Date:</td>
                <td style="color: #1e293b; font-weight: bold; text-align: right;">${dueDate}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 5px 0;">Amount Due:</td>
                <td style="color: #059669; font-weight: bold; text-align: right;">$${amountDue.toLocaleString()}</td>
              </tr>
            </table>
          </div>
          <p style="color: #475569; line-height: 1.6;">
            If you have any questions or need to discuss your payment, please contact us.
          </p>
          <p style="color: #475569; line-height: 1.6; margin-top: 30px;">
            Best regards,<br/>
            <strong>Toronto Impact Initiative Team</strong>
          </p>
        </div>
      </div>
    `,
    }),
}

// Email sending functions
export async function sendApplicationReceivedEmail(to: string, name: string, loanAmount: number) {
    const template = templates.applicationReceived(name, loanAmount)

    try {
        const result = await resend.emails.send({
            from: 'Toronto Impact Initiative <noreply@torontoimpact.org>',
            to,
            subject: template.subject,
            html: template.html,
        })

        console.log('Application received email sent:', result)
        return { success: true, data: result }
    } catch (error) {
        console.error('Failed to send application received email:', error)
        return { success: false, error }
    }
}

export async function sendApplicationApprovedEmail(to: string, name: string, loanAmount: number, conditions?: string) {
    const template = templates.applicationApproved(name, loanAmount, conditions)

    try {
        const result = await resend.emails.send({
            from: 'Toronto Impact Initiative <noreply@torontoimpact.org>',
            to,
            subject: template.subject,
            html: template.html,
        })

        console.log('Application approved email sent:', result)
        return { success: true, data: result }
    } catch (error) {
        console.error('Failed to send application approved email:', error)
        return { success: false, error }
    }
}

export async function sendApplicationRejectedEmail(to: string, name: string, reason?: string) {
    const template = templates.applicationRejected(name, reason)

    try {
        const result = await resend.emails.send({
            from: 'Toronto Impact Initiative <noreply@torontoimpact.org>',
            to,
            subject: template.subject,
            html: template.html,
        })

        console.log('Application rejected email sent:', result)
        return { success: true, data: result }
    } catch (error) {
        console.error('Failed to send application rejected email:', error)
        return { success: false, error }
    }
}

export async function sendPaymentReminderEmail(
    to: string,
    name: string,
    loanAmount: number,
    dueDate: string,
    amountDue: number
) {
    const template = templates.paymentReminder(name, loanAmount, dueDate, amountDue)

    try {
        const result = await resend.emails.send({
            from: 'Toronto Impact Initiative <noreply@torontoimpact.org>',
            to,
            subject: template.subject,
            html: template.html,
        })

        console.log('Payment reminder email sent:', result)
        return { success: true, data: result }
    } catch (error) {
        console.error('Failed to send payment reminder email:', error)
        return { success: false, error }
    }
}

export { resend }
