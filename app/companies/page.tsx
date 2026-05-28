'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { formatLPA } from '@/lib/client'

interface Company {
  id: string
  name: string
  normalizedName: string
  industry: string
  salaryCount: number
  medianTC: number
  avgTC: number
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ limit: '50' })
        if (search) params.set('search', search)
        const res = await fetch(`/api/companies?${params}`)
        const data = await res.json()
        setCompanies(data.data || [])
      } catch { setCompanies([]) }
      setLoading(false)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>Companies</h1>
            <p style={{ color: 'var(--text2)', fontSize: 15 }}>Compensation benchmarks by company</p>
          </div>
          <input
            className="input"
            placeholder="Search companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 280 }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="card" style={{ padding: 24, height: 130, background: 'var(--bg2)' }} />
            ))
          ) : companies.map(c => (
            <Link key={c.id} href={`/companies/${c.normalizedName}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 24, cursor: 'pointer', transition: 'all 0.15s', height: '100%' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{c.name}</div>
                    {c.industry && (
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 4,
                        background: 'var(--bg3)', color: 'var(--text2)',
                        border: '1px solid var(--border)',
                      }}>{c.industry}</span>
                    )}
                  </div>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: `hsl(${c.name.charCodeAt(0) * 13 % 360}, 60%, 55%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, color: 'white', fontSize: 14, flexShrink: 0,
                  }}>{c.name[0]}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>MEDIAN TC</div>
                    <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent2)' }}>
                      {c.medianTC > 0 ? formatLPA(c.medianTC) : '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>DATA POINTS</div>
                    <div className="mono" style={{ fontSize: 16, fontWeight: 700 }}>{c.salaryCount}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
