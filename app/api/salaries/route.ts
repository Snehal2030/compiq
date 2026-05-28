import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { normalizeCompanyName, calcTotalComp } from '@/lib/normalize'

const LEVELS_ORDER: Record<string, number> = {
  'Intern': 0, 'SDE-1': 1, 'SDE-2': 2, 'SDE-3': 3,
  'Senior SDE': 4, 'Staff Engineer': 5, 'Principal Engineer': 6, 'Distinguished Engineer': 7,
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const company = searchParams.get('company')
    const level = searchParams.get('level')
    const city = searchParams.get('city')
    const department = searchParams.get('department')
    const minExp = searchParams.get('minExp')
    const maxExp = searchParams.get('maxExp')
    const sortBy = searchParams.get('sortBy') || 'totalComp'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (company) {
      where.company = {
        normalizedName: { contains: normalizeCompanyName(company) }
      }
    }
    if (level) where.level = level
    if (city) where.city = { contains: city, mode: 'insensitive' }
    if (department) where.department = { contains: department, mode: 'insensitive' }
    if (minExp || maxExp) {
      where.yearsExperience = {}
      if (minExp) (where.yearsExperience as Record<string, number>).gte = parseInt(minExp)
      if (maxExp) (where.yearsExperience as Record<string, number>).lte = parseInt(maxExp)
    }

    const validSortFields = ['totalComp', 'baseSalary', 'yearsExperience', 'submittedAt', 'levelOrder']
    const orderBy = validSortFields.includes(sortBy)
      ? { [sortBy]: sortOrder }
      : { totalComp: 'desc' as const }

    const [salaries, total] = await Promise.all([
      prisma.salary.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { company: { select: { id: true, name: true, normalizedName: true, industry: true } } },
      }),
      prisma.salary.count({ where }),
    ])

    return NextResponse.json({
      data: salaries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch salaries' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req)
    const body = await req.json()

    const { companyName, jobTitle, level, baseSalary, bonus, stockPerYear, location, city, yearsExperience, yearsAtCompany, education, department } = body

    // Validation
    if (!companyName || !jobTitle || !level || !baseSalary || !location || !city || yearsExperience === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (baseSalary <= 0 || baseSalary > 100000000) {
      return NextResponse.json({ error: 'Invalid base salary' }, { status: 400 })
    }
    if (yearsExperience < 0 || yearsExperience > 50) {
      return NextResponse.json({ error: 'Invalid years of experience' }, { status: 400 })
    }

    const normalizedName = normalizeCompanyName(companyName)
    let company = await prisma.company.findUnique({ where: { normalizedName } })
    if (!company) {
      company = await prisma.company.create({
        data: { name: companyName.trim(), normalizedName }
      })
    }

    const bonusVal = Math.max(0, Number(bonus) || 0)
    const stockVal = Math.max(0, Number(stockPerYear) || 0)
    const totalComp = calcTotalComp(baseSalary, bonusVal, stockVal)
    const levelOrder = LEVELS_ORDER[level] ?? 2

    const salary = await prisma.salary.create({
      data: {
        companyId: company.id,
        userId: user?.userId,
        jobTitle: jobTitle.trim(),
        level,
        levelOrder,
        baseSalary,
        bonus: bonusVal,
        stockPerYear: stockVal,
        totalComp,
        currency: 'INR',
        location: location.trim(),
        city: city.trim(),
        yearsExperience: parseInt(yearsExperience),
        yearsAtCompany: parseInt(yearsAtCompany) || 0,
        education: education?.trim(),
        department: department?.trim(),
        tags: [level, city, company.industry || 'Tech'].filter(Boolean),
      },
      include: { company: true },
    })

    return NextResponse.json({ data: salary }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to submit salary' }, { status: 500 })
  }
}
