'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')

  // ✅ Email validation
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async () => {
    const cleanEmail = email.trim()

    // ✅ Validation
    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setError('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Wrong email or password')
        } else {
          setError(error.message)
        }
      } else {
        router.push('/dashboard')
      }
    }
  }

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#0f172a' }}>
      <div style={{ background:'#1e293b', padding:'40px', borderRadius:'12px', width:'360px' }}>
        <h2 style={{ color:'white', marginBottom:'24px' }}>
          {isSignUp ? 'Sign Up' : 'Login'} to FinanceAI
        </h2>

        <input
          placeholder="Email"
          value={email}
          onChange={e => {
            setEmail(e.target.value)
            setError('')
          }}
          style={{ width:'100%', padding:'10px', marginBottom:'12px', borderRadius:'8px', border:'none', background:'#334155', color:'white' }}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => {
            setPassword(e.target.value)
            setError('')
          }}
          style={{ width:'100%', padding:'10px', marginBottom:'12px', borderRadius:'8px', border:'none', background:'#334155', color:'white' }}
        />

        {error && <p style={{ color:'red', marginBottom:'12px' }}>{error}</p>}

        <button
          onClick={handleSubmit}
          style={{ width:'100%', padding:'12px', background:'#22c55e', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' }}
        >
          {isSignUp ? 'Create Account' : 'Login'}
        </button>

        <p
          style={{ color:'#94a3b8', marginTop:'16px', textAlign:'center', cursor:'pointer' }}
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError('')
          }}
        >
          {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </p>
      </div>
    </div>
  )
}