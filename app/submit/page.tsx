'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getAuthHeaders } from '@/lib/client'

const LEVELS = ['Intern', 'SDE-1', 'SDE-2', 'SDE-3', 'Senior SDE', 'Staff Engineer', 'Principal Engineer', 'Distinguished Engineer']
const CITIES = ['Bangalore', 'Hyderabad', 'Mumbai', 'Pune', 'Chennai', 'Delhi', 'Gurgaon', 'Noida', 'Other']
const DEPTS = ['Engineering', 'Product', 'Design', 'Data Science', 'DevOps', 'ML/AI', 'QA', 'Other']
const EDUCATIONS = ['B.Tech/B.E.', 'M.Tech/M.E.', 'MCA', 'MBA', 'B.Sc', 'M.Sc', 'PhD', 'Other']

export default function SubmitPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    companyName: '', jobTitle: 'Software Engineer', level: 'SDE-2',
    baseSalary: '', bonus: '', stockPerYear: '',
    city: 'Bangalore', location: '', yearsExperience: '',
    yearsAtCompany: '', education: 'B.Tech/B.E.', department: 'Engineering',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const totalComp = () => {
    const b = Number(form.baseSalary) || 0
    const bonus = Number(form.bonus) || 0
    const stock = Number(form.stockPerYear) || 0
    return b + bonus + stock
  }

  const submit = async () => {
    if (!form.companyName || !form.baseSalary || !form.yearsExperience) {
      setError('Please fill in all required fields')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...form,
          baseSalary: Number(form.baseSalary) * 100000,
          bonus: Number(form.bonus) * 100000,
          stockPerYear: Number(form.stockPerYear) * 100000,
          location: form.location || `${form.city}, India`,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Submission failed'); setLoading(false); return }
      setSuccess(true)
      setTimeout(() => router.push('/salaries'), 2000)
    } catch {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <>
        <Navbar />
        <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Salary submitted!</h2>
          <p style={{ color: 'var(--text2)' }}>Thanks for contributing. Redirecting to salaries...</p>
        </div>
      </>
    )
  }

  const lpaFields = [
    { key: 'baseSalary', label: 'Base Salary (LPA) *', placeholder: 'e.g. 25' },
    { key: 'bonus', label: 'Annual Bonus (LPA)', placeholder: 'e.g. 4 (optional)' },
    { key: 'stockPerYear', label: 'Stock / RSU per year (LPA)', placeholder: 'e.g. 8 (optional)' },
  ]

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>Submit Your Compensation</h1>
          <p style={{ color: 'var(--text2)', fontSize: 15 }}>Anonymous. Helps everyone negotiate better.</p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          {/* Company & Role */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Company & Role</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>Company Name *</label>
                <input className="input" placeholder="e.g. Google, Flipkart, Razorpay" value={form.companyName} onChange={e => set('companyName', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>Job Title</label>
                  <input className="input" value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>Level *</label>
                  <select className="select" value={form.level} onChange={e => set('level', e.target.value)}>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>Department</label>
                  <select className="select" value={form.department} onChange={e => set('department', e.target.value)}>
                    {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>Education</label>
                  <select className="select" value={form.education} onChange={e => set('education', e.target.value)}>
                    {EDUCATIONS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)', marginBottom: 24 }} />

          {/* Compensation */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Compensation (₹ LPA)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              {lpaFields.map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>{f.label}</label>
                  <input className="input" type="number" placeholder={f.placeholder} value={(form as Record<string,string>)[f.key]} onChange={e => set(f.key, e.target.value)} />
                </div>
              ))}
            </div>

            {/* TC Preview */}
            {totalComp() > 0 && (
              <div style={{
                marginTop: 16, padding: '14px 16px', borderRadius: 8,
                background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 13, color: 'var(--text2)' }}>Total Compensation</span>
                <span className="mono" style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent2)' }}>
                  ₹{totalComp().toFixed(1)} LPA
                </span>
              </div>
            )}
          </div>

          <div style={{ height: 1, background: 'var(--border)', marginBottom: 24 }} />

          {/* Location & Experience */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Location & Experience</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>City *</label>
                <select className="select" value={form.city} onChange={e => set('city', e.target.value)}>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>Total YOE *</label>
                <input className="input" type="number" placeholder="e.g. 3" value={form.yearsExperience} onChange={e => set('yearsExperience', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>Years at Company</label>
                <input className="input" type="number" placeholder="e.g. 1" value={form.yearsAtCompany} onChange={e => set('yearsAtCompany', e.target.value)} />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button className="btn-primary" onClick={submit} disabled={loading} style={{ width: '100%', padding: '13px', fontSize: 15 }}>
            {loading ? 'Submitting...' : 'Submit Anonymously →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 12 }}>
            Your identity is never revealed. Salary data is displayed anonymously.
          </p>
        </div>
      </div>
    </>
  )
}
