import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeCompanyName } from '@/lib/normalize'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const companiesParam = searchParams.get('companies') // comma-separated
    const level = searchParams.get('level')

    if (!companiesParam) {
      return NextResponse.json({ error: 'companies parameter required' }, { status: 400 })
    }

    const companyNames = companiesParam.split(',').map(n => n.trim()).filter(Boolean).slice(0, 4)

    const results = await Promise.all(
      companyNames.map(async (name) => {
        const normalizedName = normalizeCompanyName(name)
        const company = await prisma.company.findFirst({
          where: { normalizedName: { contains: normalizedName } },
        })
        if (!company) return { company: name, found: false, levels: [] }

        const where: Record<string, unknown> = { companyId: company.id }
        if (level) where.level = level

        const salaries = await prisma.salary.findMany({
          where,
          select: {
            level: true, levelOrder: true, baseSalary: true,
            bonus: true, stockPerYear: true, totalComp: true,
            yearsExperience: true,
          },
        })

        // Group by level
        const levelMap = new Map<string, { order: number; totals: number[]; bases: number[]; stocks: number[] }>()
        for (const s of salaries) {
          if (!levelMap.has(s.level)) {
            levelMap.set(s.level, { order: s.levelOrder, totals: [], bases: [], stocks: [] })
          }
          const entry = levelMap.get(s.level)!
          entry.totals.push(s.totalComp)
          entry.bases.push(s.baseSalary)
          entry.stocks.push(s.stockPerYear)
        }

        const levels = Array.from(levelMap.entries())
          .map(([lvl, data]) => {
            const sorted = [...data.totals].sort((a, b) => a - b)
            return {
              level: lvl,
              order: data.order,
              count: data.totals.length,
              medianTC: sorted[Math.floor(sorted.length / 2)] || 0,
              avgTC: data.totals.reduce((a, b) => a + b, 0) / (data.totals.length || 1),
              avgBase: data.bases.reduce((a, b) => a + b, 0) / (data.bases.length || 1),
              avgStock: data.stocks.reduce((a, b) => a + b, 0) / (data.stocks.length || 1),
              p25TC: sorted[Math.floor(sorted.length * 0.25)] || 0,
              p75TC: sorted[Math.floor(sorted.length * 0.75)] || 0,
            }
          })
          .sort((a, b) => a.order - b.order)

        return {
          company: company.name,
          normalizedName: company.normalizedName,
          industry: company.industry,
          found: true,
          levels,
          totalEntries: salaries.length,
        }
      })
    )

    return NextResponse.json({ data: results })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Comparison failed' }, { status: 500 })
  }
}
