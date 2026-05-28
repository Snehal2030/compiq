'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('compiq_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const logout = () => {
    localStorage.removeItem('compiq_user')
    localStorage.removeItem('compiq_token')
    setUser(null)
    window.location.href = '/'
  }

  const links = [
    { href: '/salaries', label: 'Salaries' },
    { href: '/companies', label: 'Companies' },
    { href: '/compare', label: 'Compare' },
  ]

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: 'white',
          }}>C</div>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Comp<span style={{ color: 'var(--accent)' }}>IQ</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{
              padding: '6px 14px',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600,
              color: pathname.startsWith(l.href) ? 'var(--text)' : 'var(--text2)',
              background: pathname.startsWith(l.href) ? 'var(--bg3)' : 'transparent',
              transition: 'all 0.15s',
            }}>{l.label}</Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/submit" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}>+ Add Salary</button>
              </Link>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
                    border: 'none', cursor: 'pointer', color: 'white',
                    fontWeight: 700, fontSize: 13,
                  }}>
                  {user.name[0].toUpperCase()}
                </button>
                {menuOpen && (
                  <div className="card" style={{
                    position: 'absolute', right: 0, top: 42, width: 180, padding: 8,
                  }}>
                    <div style={{ padding: '6px 10px', fontSize: 12, color: 'var(--text2)' }}>{user.email}</div>
                    <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
                    <button onClick={logout} style={{
                      width: '100%', textAlign: 'left', padding: '6px 10px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--red)', fontSize: 14, fontFamily: 'var(--font-sans)', borderRadius: 6,
                    }}>Sign out</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href="/auth" style={{ textDecoration: 'none' }}>
                <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: 13 }}>Sign in</button>
              </Link>
              <Link href="/submit" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}>+ Add Salary</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
