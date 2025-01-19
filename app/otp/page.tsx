'use client'
import { Analytics } from "@vercel/analytics/react"
import { useState, useEffect, Suspense } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'

const VerificationCodeForm = () => {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const searchParams = useSearchParams()
  const username = searchParams.get('username')

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...code]
      newCode[index] = value
      setCode(newCode)
      
      if (value !== '' && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`)
        nextInput?.focus()
      } 
      else if (value === '' && index > 0) {
        const prevInput = document.getElementById(`code-${index - 1}`)
        prevInput?.focus()
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    const pastedValue = e.clipboardData.getData('text').slice(0, 6);
    const newCode = [...code];
    
    for (let i = 0; i < pastedValue.length; i++) {
      newCode[i] = pastedValue[i];
    }

    setCode(newCode);

    if (pastedValue.length && index < 5) {
      const nextInput = document.getElementById(`code-${index + pastedValue.length}`);
      nextInput?.focus();
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const verificationCode = code.join('')
    setIsVerifying(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await axios.get(`${process.env.BASE_URL}api/accounts/login-verify/${verificationCode}`)

      console.log('API Response:', response.data)

      if (response.status === 200) {
        setSuccessMessage('Login successful!')

        localStorage.setItem('fortify_access', response.data.access_token)
        localStorage.setItem('fortify_refresh', response.data.refresh_token)
        localStorage.setItem('fortify_username', response.data.username)

        window.location.href = '/'
      } else {
        setError(response.data.message || 'Something went wrong')
      }
    } catch (err) {
      console.error('Error occurred:', err)
      setError('An error occurred while processing your request.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    if (!username) {
        setError('Username not found. Please try again.');
        return;
    }

    setIsResending(true);
    setError('');
    setSuccessMessage('');

    try {
        const response = await axios.post(`${process.env.BASE_URL}api/accounts/resend-otp/`, {
            username, // ارسال username به عنوان بخشی از بدنه درخواست
        });

        if (response.status === 200) {
            setSuccessMessage('OTP has been resent. Please check your email.');
            setCountdown(60); // Start a 60-second countdown
        }
    } catch (error) {
        setError('There was an error resending the OTP. Please try again.');
    } finally {
        setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-700 via-purple-600 to-purple-500">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png?height=40&width=100"
              alt="Logo"
              width={100}
              height={40}
              className="mx-auto"
            />
          </Link>
        </div>
        <div className="bg-[#1F1D2B] rounded-3xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Verify Your Account</h2>
          <p className="text-gray-400 mb-6 text-center">
            We've sent a verification code to your email. Please enter it below.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onPaste={(e) => handlePaste(e, index)}
                  className="w-12 h-12 text-center text-2xl bg-[#2D2A3D] border-0 text-white focus:ring-2 focus:ring-purple-500"
                />
              ))}
            </div>
            <Button 
              type="submit" 
              className="w-full bg-purple-500 hover:bg-purple-600 text-white transition duration-300"
              disabled={isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>
          </form>
          {successMessage && (
            <div className="mt-4 text-center text-green-500">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mt-4 text-center text-red-500">
              {error}
            </div>
          )}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Didn't receive the code?{' '}
              <Button 
                variant="link" 
                className="text-purple-400 hover:text-purple-300 p-0"
                onClick={handleResendOTP}
                disabled={isResending || countdown > 0}
              >
                {countdown > 0
                  ? `Resend in ${countdown}s`
                  : isResending
                  ? 'Resending...'
                  : 'Resend'}
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerificationCodePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerificationCodeForm />
    </Suspense>
  )
}
