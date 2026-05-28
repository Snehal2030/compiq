'use client'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import { formatLPA } from '@/lib/client'

const LEVELS = ['Intern', 'SDE-1', 'SDE-2', 'SDE-3', 'Senior SDE', 'Staff Engineer', 'Principal Engineer', 'Distinguished Engineer']
const CITIES = ['Bangalore', 'Hyderabad', 'Mumbai', 'Pune', 'Chennai', 'Delhi', 'Gurgaon', 'Noida']
const DEPTS = ['Engineering', 'Product', 'Design', 'Data Science', 'DevOps', 'ML/AI']

interface Salary {
  id: string
  jobTitle: string
  level: string
  baseSalary: number
  bonus: number
  stockPerYear: number
  totalComp: number
  city: string
  yearsExperience: number
  department: string
  verified: boolean
  submittedAt: string
  company: { name: string; industry: string }
}

interface Pagination {
  page: number
  pages: number
  total: number
}

export default function SalariesPage() {
  const [salaries, setSalaries] = useState<Salary[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const [filters, setFilters] = useState({
    company: '', level: '', city: '', department: '', minExp: '', maxExp: '',
    sortBy: 'totalComp', sortOrder: 'desc',
  })

  const fetchSalaries = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    params.set('page', String(page))
    params.set('limit', '20')
    try {
      const res = await fetch(`/api/salaries?${params}`)
      const data = await res.json()
      setSalaries(data.data || [])
      setPagination(data.pagination)
    } catch { setSalaries([]) }
    setLoading(false)
  }, [filters, page])

  useEffect(() => { fetchSalaries() }, [fetchSalaries])

  const setFilter = (k: string, v: string) => {
    setFilters(f => ({ ...f, [k]: v }))
    setPage(1)
  }

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>Salary Data</h1>
          <p style={{ color: 'var(--text2)', fontSize: 15 }}>
            {pagination?.total?.toLocaleString() || '—'} verified compensation reports from Indian tech
          </p>
        </div>

        {/* Filters */}
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <input
              className="input"
              placeholder="Company..."
              value={filters.company}
              onChange={e => setFilter('company', e.target.value)}
            />
            <select className="select" value={filters.level} onChange={e => setFilter('level', e.target.value)}>
              <option value="">All Levels</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select className="select" value={filters.city} onChange={e => setFilter('city', e.target.value)}>
              <option value="">All Cities</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="select" value={filters.department} onChange={e => setFilter('department', e.target.value)}>
              <option value="">All Depts</option>
              {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input className="input" placeholder="Min YOE" type="number" value={filters.minExp} onChange={e => setFilter('minExp', e.target.value)} />
            <input className="input" placeholder="Max YOE" type="number" value={filters.maxExp} onChange={e => setFilter('maxExp', e.target.value)} />
            <select className="select" value={filters.sortBy} onChange={e => setFilter('sortBy', e.target.value)}>
              <option value="totalComp">Sort: Total TC</option>
              <option value="baseSalary">Sort: Base</option>
              <option value="yearsExperience">Sort: YOE</option>
              <option value="submittedAt">Sort: Recent</option>
            </select>
            <select className="select" value={filters.sortOrder} onChange={e => setFilter('sortOrder', e.target.value)}>
              <option value="desc">↓ High to Low</option>
              <option value="asc">↑ Low to High</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                  {['Company', 'Level', 'Base', 'Bonus', 'Stock/yr', 'Total TC', 'Location', 'YOE'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: 12, fontWeight: 600, color: 'var(--text3)',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} style={{ padding: '14px 16px' }}>
                          <div style={{ height: 14, borderRadius: 4, background: 'var(--bg3)', width: `${60 + Math.random() * 40}%`, animation: 'pulse 1.5s infinite' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : salaries.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: 'var(--text3)' }}>
                      No data found for these filters
                    </td>
                  </tr>
                ) : salaries.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{s.company.name}</div>
                      {s.verified && <span className="badge badge-verified" style={{ marginTop: 3 }}>✓ verified</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-level">{s.level}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }} className="mono">{formatLPA(s.baseSalary)}</td>
                    <td style={{ padding: '14px 16px' }} className="mono" >
                      {s.bonus > 0 ? formatLPA(s.bonus) : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }} className="mono" >
                      {s.stockPerYear > 0 ? formatLPA(s.stockPerYear) : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="mono" style={{ fontWeight: 700, color: 'var(--accent2)', fontSize: 15 }}>
                        {formatLPA(s.totalComp)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text2)', fontSize: 13 }}>{s.city}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text2)', fontSize: 13 }}>{s.yearsExperience}y</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>
                Page {pagination.page} of {pagination.pages} ({pagination.total.toLocaleString()} total)
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }}
                  disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }}
                  disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
