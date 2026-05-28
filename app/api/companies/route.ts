import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface CompanyWithCount {
  id: string
  name: string
  normalizedName: string
  industry: string | null
  website: string | null
  _count: { salaries: number }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {}

    const companies = await prisma.company.findMany({
      where,
      take: limit,
      include: { _count: { select: { salaries: true } } },
      orderBy: { salaries: { _count: 'desc' } },
    }) as CompanyWithCount[]

    const enriched = await Promise.all(
      companies.map(async (company: CompanyWithCount) => {
        const salaries = await prisma.salary.findMany({
          where: { companyId: company.id },
          select: { totalComp: true },
          orderBy: { totalComp: 'asc' },
        })
        const totals = salaries.map((s: { totalComp: number }) => s.totalComp)
        const medianTC = totals.length > 0 ? totals[Math.floor(totals.length / 2)] : 0
        const avgTC = totals.length > 0 ? totals.reduce((a: number, b: number) => a + b, 0) / totals.length : 0
        return { ...company, salaryCount: company._count.salaries, medianTC, avgTC }
      })
    )

    return NextResponse.json({ data: enriched })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
  }
}
