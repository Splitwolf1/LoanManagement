import { PrismaClient, UserRole, LoanStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@torontoimpact.org' },
    update: {},
    create: {
      email: 'admin@torontoimpact.org',
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  })

  const volunteerUser = await prisma.user.upsert({
    where: { email: 'volunteer@torontoimpact.org' },
    update: {},
    create: {
      email: 'volunteer@torontoimpact.org',
      name: 'Volunteer User',
      role: UserRole.VOLUNTEER,
    },
  })

  // Create borrowers
  const borrower1 = await prisma.borrower.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (416) 555-0123',
      address: '123 Main St, Toronto, ON M5V 3A8',
      notes: 'Local bakery owner, excellent credit history',
    },
  })

  const borrower2 = await prisma.borrower.create({
    data: {
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+1 (416) 555-0456',
      address: '456 Queen St, Toronto, ON M5H 2N2',
      notes: 'Coffee shop entrepreneur, first-time borrower',
    },
  })

  const borrower3 = await prisma.borrower.create({
    data: {
      name: 'ABC Tech Solutions',
      email: 'contact@abctech.ca',
      phone: '+1 (416) 555-0789',
      address: '789 King St, Toronto, ON M5K 1E7',
      notes: 'Small tech startup, expanding operations',
    },
  })

  // Create loans
  const loan1 = await prisma.loan.create({
    data: {
      borrowerId: borrower1.id,
      amount: 5000,
      interestRate: 3.5,
      issuedAt: new Date('2024-01-15'),
      dueDate: new Date('2025-01-15'),
      status: LoanStatus.ACTIVE,
      notes: 'Equipment purchase for bakery expansion',
    },
  })

  const loan2 = await prisma.loan.create({
    data: {
      borrowerId: borrower2.id,
      amount: 3000,
      interestRate: 4.0,
      issuedAt: new Date('2024-03-01'),
      dueDate: new Date('2025-03-01'),
      status: LoanStatus.ACTIVE,
      notes: 'Initial inventory and setup costs',
    },
  })

  const loan3 = await prisma.loan.create({
    data: {
      borrowerId: borrower3.id,
      amount: 10000,
      interestRate: 5.0,
      issuedAt: new Date('2024-02-10'),
      dueDate: new Date('2025-02-10'),
      status: LoanStatus.ACTIVE,
      notes: 'Office equipment and software licenses',
    },
  })

  const loan4 = await prisma.loan.create({
    data: {
      borrowerId: borrower1.id,
      amount: 2000,
      interestRate: 3.0,
      issuedAt: new Date('2023-06-01'),
      dueDate: new Date('2024-06-01'),
      status: LoanStatus.PAID,
      notes: 'Previous loan - fully repaid',
    },
  })

  // Create payments
  await prisma.payment.create({
    data: {
      loanId: loan1.id,
      amount: 1000,
      paidAt: new Date('2024-02-15'),
      notes: 'First installment',
      method: 'bank_transfer',
    },
  })

  await prisma.payment.create({
    data: {
      loanId: loan1.id,
      amount: 1000,
      paidAt: new Date('2024-05-15'),
      notes: 'Second installment',
      method: 'bank_transfer',
    },
  })

  await prisma.payment.create({
    data: {
      loanId: loan2.id,
      amount: 500,
      paidAt: new Date('2024-04-01'),
      notes: 'Partial payment',
      method: 'cash',
    },
  })

  await prisma.payment.create({
    data: {
      loanId: loan3.id,
      amount: 2500,
      paidAt: new Date('2024-03-10'),
      notes: 'Quarterly payment',
      method: 'cheque',
    },
  })

  // Payments for the completed loan
  await prisma.payment.create({
    data: {
      loanId: loan4.id,
      amount: 1000,
      paidAt: new Date('2023-12-01'),
      notes: 'First payment',
      method: 'bank_transfer',
    },
  })

  await prisma.payment.create({
    data: {
      loanId: loan4.id,
      amount: 1060,
      paidAt: new Date('2024-06-01'),
      notes: 'Final payment with interest',
      method: 'bank_transfer',
    },
  })

  // Create audit logs
  await prisma.auditLog.create({
    data: {
      actorId: adminUser.id,
      action: 'LOAN_CREATED',
      payload: JSON.stringify({ loanId: loan1.id, amount: 5000 }),
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId: volunteerUser.id,
      action: 'PAYMENT_RECEIVED',
      payload: JSON.stringify({ loanId: loan1.id, amount: 1000 }),
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log(`👥 Created ${await prisma.user.count()} users`)
  console.log(`🏦 Created ${await prisma.borrower.count()} borrowers`)
  console.log(`💰 Created ${await prisma.loan.count()} loans`)
  console.log(`💳 Created ${await prisma.payment.count()} payments`)
  console.log(`📋 Created ${await prisma.auditLog.count()} audit logs`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })