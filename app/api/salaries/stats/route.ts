import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeCompanyName } from '@/lib/normalize'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const company = searchParams.get('company')
    const level = searchParams.get('level')

    const where: Record<string, unknown> = {}
    if (company) {
      where.company = { normalizedName: { contains: normalizeCompanyName(company) } }
    }
    if (level) where.level = level

    const salaries = await prisma.salary.findMany({
      where,
      select: {
        level: true, levelOrder: true, baseSalary: true,
        bonus: true, stockPerYear: true, totalComp: true,
      },
    })

    if (salaries.length === 0) {
      return NextResponse.json({ stats: null, byLevel: [] })
    }

    const totals = salaries.map((s: { totalComp: number }) => s.totalComp).sort((a: number, b: number) => a - b)
    const median = totals[Math.floor(totals.length / 2)]
    const avg = totals.reduce((a: number, b: number) => a + b, 0) / totals.length
    const p25 = totals[Math.floor(totals.length * 0.25)]
    const p75 = totals[Math.floor(totals.length * 0.75)]
    const p90 = totals[Math.floor(totals.length * 0.9)]

    type LevelEntry = { order: number; totals: number[]; bases: number[] }
    const levelMap = new Map<string, LevelEntry>()
    for (const s of salaries) {
      if (!levelMap.has(s.level)) {
        levelMap.set(s.level, { order: s.levelOrder, totals: [], bases: [] })
      }
      levelMap.get(s.level)!.totals.push(s.totalComp)
      levelMap.get(s.level)!.bases.push(s.baseSalary)
    }

    const byLevel = Array.from(levelMap.entries())
      .map(([level, data]) => {
        const sorted = [...data.totals].sort((a, b) => a - b)
        return {
          level, order: data.order,
          count: data.totals.length,
          medianTC: sorted[Math.floor(sorted.length / 2)],
          avgTC: data.totals.reduce((a, b) => a + b, 0) / data.totals.length,
          p25TC: sorted[Math.floor(sorted.length * 0.25)],
          p75TC: sorted[Math.floor(sorted.length * 0.75)],
          avgBase: data.bases.reduce((a, b) => a + b, 0) / data.bases.length,
        }
      })
      .sort((a, b) => a.order - b.order)

    return NextResponse.json({ stats: { count: salaries.length, median, avg, p25, p75, p90 }, byLevel })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to compute stats' }, { status: 500 })
  }
}
