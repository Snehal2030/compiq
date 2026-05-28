import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const companies = [
  { name: 'Google', normalizedName: 'google', industry: 'Technology', website: 'google.com' },
  { name: 'Microsoft', normalizedName: 'microsoft', industry: 'Technology', website: 'microsoft.com' },
  { name: 'Amazon', normalizedName: 'amazon', industry: 'Technology', website: 'amazon.com' },
  { name: 'Meta', normalizedName: 'meta', industry: 'Technology', website: 'meta.com' },
  { name: 'Flipkart', normalizedName: 'flipkart', industry: 'E-Commerce', website: 'flipkart.com' },
  { name: 'Swiggy', normalizedName: 'swiggy', industry: 'Food Tech', website: 'swiggy.com' },
  { name: 'Zomato', normalizedName: 'zomato', industry: 'Food Tech', website: 'zomato.com' },
  { name: 'Razorpay', normalizedName: 'razorpay', industry: 'Fintech', website: 'razorpay.com' },
  { name: 'Paytm', normalizedName: 'paytm', industry: 'Fintech', website: 'paytm.com' },
  { name: 'Infosys', normalizedName: 'infosys', industry: 'IT Services', website: 'infosys.com' },
  { name: 'TCS', normalizedName: 'tcs', industry: 'IT Services', website: 'tcs.com' },
  { name: 'Wipro', normalizedName: 'wipro', industry: 'IT Services', website: 'wipro.com' },
  { name: 'Atlassian', normalizedName: 'atlassian', industry: 'Technology', website: 'atlassian.com' },
  { name: 'Uber', normalizedName: 'uber', industry: 'Mobility', website: 'uber.com' },
  { name: 'Dream11', normalizedName: 'dream11', industry: 'Gaming', website: 'dream11.com' },
]

const levels = [
  { label: 'Intern', order: 0 },
  { label: 'SDE-1', order: 1 },
  { label: 'SDE-2', order: 2 },
  { label: 'SDE-3', order: 3 },
  { label: 'Senior SDE', order: 4 },
  { label: 'Staff Engineer', order: 5 },
  { label: 'Principal Engineer', order: 6 },
  { label: 'Distinguished Engineer', order: 7 },
]

const cities = ['Bangalore', 'Hyderabad', 'Mumbai', 'Pune', 'Chennai', 'Delhi', 'Gurgaon', 'Noida']

const departments = ['Engineering', 'Product', 'Design', 'Data Science', 'DevOps', 'ML/AI']

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateSalary(company: string, level: { label: string; order: number }) {
  const baseMultipliers: Record<string, number> = {
    google: 2.5, microsoft: 2.3, amazon: 2.2, meta: 2.6,
    flipkart: 1.8, swiggy: 1.5, zomato: 1.5, razorpay: 1.7,
    paytm: 1.3, infosys: 0.8, tcs: 0.7, wipro: 0.75,
    atlassian: 2.0, uber: 2.1, dream11: 1.6,
  }
  const mult = baseMultipliers[company] || 1.0
  const baseLPA = [5, 12, 20, 30, 45, 65, 90, 130][level.order] * mult
  const base = Math.round(baseLPA * randomBetween(90, 110) / 100) * 100000
  const bonus = Math.round(base * randomBetween(10, 25) / 100)
  const stock = Math.round(base * randomBetween(15, 60) / 100)
  return { base, bonus, stock, total: base + bonus + stock }
}

async function main() {
  console.log('Seeding companies...')
  await prisma.company.deleteMany()
  await prisma.salary.deleteMany()

  for (const c of companies) {
    await prisma.company.create({ data: c })
  }

  console.log('Seeding salaries...')
  const createdCompanies = await prisma.company.findMany()

  for (const company of createdCompanies) {
    for (const level of levels) {
      const count = randomBetween(3, 8)
      for (let i = 0; i < count; i++) {
        const sal = generateSalary(company.normalizedName, level)
        const city = cities[randomBetween(0, cities.length - 1)]
        await prisma.salary.create({
          data: {
            companyId: company.id,
            jobTitle: `Software Engineer`,
            level: level.label,
            levelOrder: level.order,
            baseSalary: sal.base,
            bonus: sal.bonus,
            stockPerYear: sal.stock,
            totalComp: sal.total,
            currency: 'INR',
            location: `${city}, India`,
            city,
            country: 'India',
            yearsExperience: Math.max(0, level.order * 2 + randomBetween(-1, 2)),
            yearsAtCompany: randomBetween(0, 4),
            department: departments[randomBetween(0, departments.length - 1)],
            verified: Math.random() > 0.3,
            tags: [level.label, city, company.industry || 'Tech'].filter(Boolean),
          }
        })
      }
    }
  }
  console.log('Seed complete!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
