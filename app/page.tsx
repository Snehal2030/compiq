import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function HomePage() {
  const stats = [
    { label: 'Salary Data Points', value: '2,400+' },
    { label: 'Companies Tracked', value: '150+' },
    { label: 'Cities', value: '12' },
    { label: 'Levels Mapped', value: '8' },
  ]

  const features = [
    {
      icon: '⚖️',
      title: 'Levels Matter More Than Titles',
      desc: 'A "Senior Engineer" at Infosys ≠ a "Senior Engineer" at Google. We normalize by actual level, not vanity titles.',
    },
    {
      icon: '📊',
      title: 'Total Compensation',
      desc: 'See base, bonus, and stock separately. Compare apples to apples with TC breakdowns across every level.',
    },
    {
      icon: '🔍',
      title: 'Deep Filters',
      desc: 'Filter by company, level, city, YOE, and department. Find exactly what you\'re negotiating for.',
    },
    {
      icon: '📈',
      title: 'Side-by-Side Compare',
      desc: 'Compare up to 4 companies across all levels simultaneously. See compensation curves, not just snapshots.',
    },
  ]

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section style={{ padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(108,99,255,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 20,
              background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)',
              marginBottom: 28, fontSize: 13, color: '#a78bfa',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3a0', display: 'inline-block' }} />
              Real data from real engineers in India
            </div>

            <h1 style={{
              fontSize: 'clamp(36px, 6vw, 64px)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: 20,
            }}>
              Know your worth.<br />
              <span style={{ color: 'var(--accent)' }}>Down to the level.</span>
            </h1>

            <p style={{ fontSize: 18, color: 'var(--text2)', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.6 }}>
              Compensation intelligence for Indian tech. Compare TC by level, role, and company.
              Because levels matter more than titles.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/salaries" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ padding: '12px 28px', fontSize: 16 }}>Browse Salaries</button>
              </Link>
              <Link href="/compare" style={{ textDecoration: 'none' }}>
                <button className="btn-ghost" style={{ padding: '12px 28px', fontSize: 16 }}>Compare Companies</button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{ padding: '0 24px 60px' }}>
          <div style={{
            maxWidth: 900, margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16,
          }}>
            {stats.map(s => (
              <div key={s.label} className="card" style={{ padding: '24px', textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32, letterSpacing: '-0.02em' }}>
              Built for real negotiation
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
              {features.map(f => (
                <div key={f.title} className="card" style={{ padding: 24 }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
                  <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{
            maxWidth: 900, margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(167,139,250,0.06))',
            border: '1px solid rgba(108,99,255,0.25)',
            borderRadius: 16, padding: '48px 36px', textAlign: 'center',
          }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>
              Share your data. Help the community.
            </h2>
            <p style={{ color: 'var(--text2)', marginBottom: 28, fontSize: 15 }}>
              Anonymous salary submissions power this platform. Add yours in 2 minutes.
            </p>
            <Link href="/submit" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '12px 32px', fontSize: 15 }}>Submit Your Compensation</button>
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
