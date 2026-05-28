'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { formatLPA } from '@/lib/client'

interface LevelStats {
  level: string
  order: number
  count: number
  medianTC: number
  avgTC: number
  p25TC: number
  p75TC: number
  avgBase: number
}

export default function CompanyDetailPage() {
  const { slug } = useParams() as { slug: string }
  const [stats, setStats] = useState<{ count: number; median: number; avg: number; p25: number; p75: number; p90: number } | null>(null)
  const [byLevel, setByLevel] = useState<LevelStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/salaries/stats?company=${slug}`)
        const data = await res.json()
        setStats(data.stats)
        setByLevel(data.byLevel || [])
      } catch { /**/ }
      setLoading(false)
    }
    load()
  }, [slug])

  const companyName = slug.charAt(0).toUpperCase() + slug.slice(1)

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: `hsl(${companyName.charCodeAt(0) * 13 % 360}, 60%, 55%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: 'white', fontSize: 22,
          }}>{companyName[0]}</div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>{companyName}</h1>
            {stats && <p style={{ color: 'var(--text2)', fontSize: 15 }}>{stats.count} salary records</p>}
          </div>
        </div>

        {/* Summary Cards */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Median TC', value: formatLPA(stats.median) },
              { label: 'Avg TC', value: formatLPA(stats.avg) },
              { label: 'P25 TC', value: formatLPA(stats.p25) },
              { label: 'P75 TC', value: formatLPA(stats.p75) },
              { label: 'P90 TC', value: formatLPA(stats.p90) },
              { label: 'Data Points', value: stats.count.toString() },
            ].map(stat => (
              <div key={stat.label} className="card" style={{ padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>{stat.label}</div>
                <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent2)' }}>{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* By Level Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontWeight: 700, fontSize: 16 }}>Compensation by Level</h2>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>
              Levels are what matter. Not job titles.
            </p>
          </div>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
          ) : byLevel.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text3)' }}>No data available</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)' }}>
                    {['Level', 'Median TC', 'Avg TC', 'Avg Base', 'P25', 'P75', 'Count'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left',
                        fontSize: 11, fontWeight: 600, color: 'var(--text3)',
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {byLevel.map(l => (
                    <tr key={l.level} style={{ borderTop: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="badge badge-level">{l.level}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="mono" style={{ fontWeight: 700, color: 'var(--accent2)' }}>{formatLPA(l.medianTC)}</span>
                      </td>
                      <td className="mono" style={{ padding: '14px 16px' }}>{formatLPA(l.avgTC)}</td>
                      <td className="mono" style={{ padding: '14px 16px', color: 'var(--text2)' }}>{formatLPA(l.avgBase)}</td>
                      <td className="mono" style={{ padding: '14px 16px', color: 'var(--text2)' }}>{formatLPA(l.p25TC)}</td>
                      <td className="mono" style={{ padding: '14px 16px', color: 'var(--text2)' }}>{formatLPA(l.p75TC)}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text2)', fontSize: 13 }}>{l.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
