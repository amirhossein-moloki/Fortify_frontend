'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import Image from 'next/image'

export default function VerificationCodePage() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...code]
      newCode[index] = value
      setCode(newCode)
      
      // Move to next input if value is entered
      if (value !== '' && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`)
        nextInput?.focus()
      } 
      // Move to previous input if value is deleted
      else if (value === '' && index > 0) {
        const prevInput = document.getElementById(`code-${index - 1}`)
        prevInput?.focus()
      }
    }
  }

  // This function handles the pasting of code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    const pastedValue = e.clipboardData.getData('text').slice(0, 6);  // limit to 6 digits
    const newCode = [...code];
    
    // Fill in all inputs with the pasted value
    for (let i = 0; i < pastedValue.length; i++) {
      newCode[i] = pastedValue[i];
    }

    setCode(newCode);

    // Focus on the next input after paste
    if (pastedValue.length && index < 5) {
      const nextInput = document.getElementById(`code-${index + pastedValue.length}`);
      nextInput?.focus();
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const verificationCode = code.join('')

    // ارسال درخواست به API برای تایید OTP
    try {
      const response = await fetch(`${process.env.BASE_URL}api/accounts/login-verify/${verificationCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      // چاپ پاسخ API در کنسول برای بررسی
      console.log('API Response:', data)

      if (response.ok) {
        // اگر درخواست موفقیت‌آمیز بود
        setSuccessMessage('Login successful!')

        // ذخیره توکن‌ها و نام کاربری در localStorage
        localStorage.setItem('fortify_access', data.access_token)
        localStorage.setItem('fortify_refresh', data.refresh_token)
        localStorage.setItem('fortify_username', data.username)  // ذخیره نام کاربری

        // هدایت به صفحه اصلی با استفاده از window.location.href
        window.location.href = '/'  // صفحه اصلی

        // پاک کردن ارور
        setError('')
      } else {
        // اگر درخواست خطا داشت
        setError(data.message || 'Something went wrong')
        setSuccessMessage('') // پیام موفقیت را پاک می‌کنیم
      }
    } catch (err) {
      console.error('Error occurred:', err)
      setError('An error occurred while processing your request.')
      setSuccessMessage('') // پیام موفقیت را پاک می‌کنیم
    }
  }

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
                  onPaste={(e) => handlePaste(e, index)}  // Handling paste event
                  className="w-12 h-12 text-center text-2xl bg-[#2D2A3D] border-0 text-white focus:ring-2 focus:ring-purple-500"
                />
              ))}
            </div>
            <Button type="submit" className="w-full bg-purple-500 hover:bg-purple-600 text-white transition duration-300">
              Verify
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
              <Button variant="link" className="text-purple-400 hover:text-purple-300 p-0">
                Resend
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
