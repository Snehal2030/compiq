'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { formatLPA } from '@/lib/client'

const LEVELS_ORDER = ['Intern', 'SDE-1', 'SDE-2', 'SDE-3', 'Senior SDE', 'Staff Engineer', 'Principal Engineer', 'Distinguished Engineer']
const COLORS = ['#6c63ff', '#22d3a0', '#f5c842', '#ff6b6b']

interface LevelData {
  level: string
  order: number
  count: number
  medianTC: number
  avgTC: number
  avgBase: number
  avgStock: number
  p25TC: number
  p75TC: number
}

interface CompanyResult {
  company: string
  found: boolean
  levels: LevelData[]
  totalEntries: number
  industry?: string
}

export default function ComparePage() {
  const [inputs, setInputs] = useState(['Google', 'Microsoft', ''])
  const [results, setResults] = useState<CompanyResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState('')
  const [error, setError] = useState('')

  const compare = async () => {
    const companies = inputs.filter(i => i.trim())
    if (companies.length < 2) { setError('Enter at least 2 companies'); return }
    setError('')
    setLoading(true)
    try {
      const params = new URLSearchParams({ companies: companies.join(',') })
      if (selectedLevel) params.set('level', selectedLevel)
      const res = await fetch(`/api/compare?${params}`)
      const data = await res.json()
      setResults(data.data || [])
    } catch { setError('Comparison failed. Please try again.') }
    setLoading(false)
  }

  // Get all unique levels across all companies
  const allLevels = LEVELS_ORDER.filter(l =>
    results.some(r => r.levels.some(rl => rl.level === l))
  )

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>Compare Companies</h1>
          <p style={{ color: 'var(--text2)', fontSize: 15 }}>
            Side-by-side compensation comparison across all levels
          </p>
        </div>

        {/* Input */}
        <div className="card" style={{ padding: 24, marginBottom: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
            {inputs.map((val, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 10, height: 10, borderRadius: '50%', background: COLORS[i],
                  pointerEvents: 'none',
                }} />
                <input
                  className="input"
                  placeholder={`Company ${i + 1}...`}
                  value={val}
                  onChange={e => {
                    const next = [...inputs]
                    next[i] = e.target.value
                    setInputs(next)
                  }}
                  style={{ paddingLeft: 30 }}
                />
              </div>
            ))}
            {inputs.length < 4 && (
              <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => setInputs([...inputs, ''])}>
                + Add Company
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <select className="select" value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)} style={{ maxWidth: 200 }}>
              <option value="">All Levels</option>
              {LEVELS_ORDER.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <button className="btn-primary" onClick={compare} disabled={loading} style={{ padding: '10px 24px' }}>
              {loading ? 'Comparing...' : 'Compare →'}
            </button>
          </div>
          {error && <div style={{ marginTop: 12, color: 'var(--red)', fontSize: 13 }}>{error}</div>}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <>
            {/* Company Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${results.length}, 1fr)`, gap: 16, marginBottom: 24 }}>
              {results.map((r, i) => (
                <div key={r.company} className="card" style={{ padding: 20, borderTop: `3px solid ${COLORS[i]}` }}>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{r.company}</div>
                  {!r.found ? (
                    <div style={{ color: 'var(--red)', fontSize: 13 }}>No data found</div>
                  ) : (
                    <>
                      {r.industry && <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>{r.industry}</div>}
                      <div className="mono" style={{ fontSize: 13, color: 'var(--text2)' }}>{r.totalEntries} data points</div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Level-by-Level Table */}
            {allLevels.length > 0 && (
              <div className="card" style={{ overflow: 'hidden', marginBottom: 24 }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                  <h2 style={{ fontWeight: 700, fontSize: 16 }}>Median Total Compensation by Level</h2>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg3)' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Level</th>
                        {results.map((r, i) => (
                          <th key={r.company} style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: COLORS[i] }}>{r.company}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allLevels.map(level => (
                        <tr key={level} style={{ borderTop: '1px solid var(--border)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <td style={{ padding: '14px 16px' }}>
                            <span className="badge badge-level">{level}</span>
                          </td>
                          {results.map((r, ci) => {
                            const ld = r.levels.find(l => l.level === level)
                            const maxTC = Math.max(...results.map(rr => rr.levels.find(l => l.level === level)?.medianTC || 0))
                            const isMax = ld && ld.medianTC === maxTC && maxTC > 0
                            return (
                              <td key={r.company} style={{ padding: '14px 16px', textAlign: 'right' }}>
                                {ld ? (
                                  <span className="mono" style={{
                                    fontWeight: 700, fontSize: 15,
                                    color: isMax ? COLORS[ci] : 'var(--text)',
                                  }}>
                                    {formatLPA(ld.medianTC)}
                                    {isMax && ' ↑'}
                                  </span>
                                ) : <span style={{ color: 'var(--text3)' }}>—</span>}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Breakdown by company */}
            {results.filter(r => r.found).map((r, ci) => (
              <div key={r.company} className="card" style={{ overflow: 'hidden', marginBottom: 16, borderTop: `2px solid ${COLORS[ci]}` }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: COLORS[ci] }}>{r.company} — TC Breakdown</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg3)' }}>
                        {['Level', 'Median TC', 'Avg Base', 'Avg Stock', 'P25 – P75', 'N'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: 'var(--text3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {r.levels.map(l => (
                        <tr key={l.level} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px' }}><span className="badge badge-level">{l.level}</span></td>
                          <td style={{ padding: '12px 16px' }} className="mono"><span style={{ fontWeight: 700, color: COLORS[ci] }}>{formatLPA(l.medianTC)}</span></td>
                          <td style={{ padding: '12px 16px' }} className="mono" >{formatLPA(l.avgBase)}</td>
                          <td style={{ padding: '12px 16px' }} className="mono" >{l.avgStock > 0 ? formatLPA(l.avgStock) : '—'}</td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text2)' }} className="mono">{formatLPA(l.p25TC)} – {formatLPA(l.p75TC)}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text2)', fontSize: 13 }}>{l.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </>
        )}

        {results.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text3)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
            <div style={{ fontSize: 16, marginBottom: 6 }}>Enter companies above to compare</div>
            <div style={{ fontSize: 13 }}>Try: Google vs Microsoft vs Amazon</div>
          </div>
        )}
      </div>
    </>
  )
}
