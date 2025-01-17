'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'
import { redirectToChat } from '@/app/actions/auth'

const BASE_URL = 'http://localhost:8000/'

export default function GmailActivationPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [activationError, setActivationError] = useState('')
  const [activationSuccess, setActivationSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  
  useEffect(() => {
    const emailFromUrl = searchParams.get('email')
    if (emailFromUrl) {
      setEmail(emailFromUrl)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptTerms) {
      alert('Please accept the terms and conditions')
      return
    }

    setIsLoading(true)
    setActivationError('')
    setActivationSuccess('')

    const uid = searchParams.get('uid')
    const token = searchParams.get('token')
    const apiUrl = `${BASE_URL}api/accounts/activate-email/${uid}/${token}/`
    console.log('Sending activation request to:', apiUrl)

    try {
      const response = await axios.post(apiUrl)

      console.log('Activation response:', response.data)

      localStorage.setItem('fortify_access', response.data.access_token)
      localStorage.setItem('fortify_refresh', response.data.refresh_token)

      setActivationSuccess('Email activated successfully!')
      
      // Redirect to chat page after a short delay
      setTimeout(() => {
        redirectToChat()
      }, 1500)
    } catch (error) {
      console.error('Activation error:', error)
      setActivationError('There was an error activating your email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setIsResending(true)
    setActivationError('')
    setActivationSuccess('')

    const apiUrl = `${BASE_URL}api/accounts/resend-activation-email/`
    console.log('Sending resend activation email request to:', apiUrl)

    try {
      const response = await axios.post(apiUrl, { email })
      
      console.log('Resend activation email response:', response.data)

      if (response.status === 200) {
        setActivationSuccess('Activation email has been resent. Please check your inbox.')
      }
    } catch (error) {
      console.error('Resend activation email error:', error)
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setActivationError('No inactive user found with this email.')
      } else {
        setActivationError('There was an error resending the activation email. Please try again.')
      }
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-700 via-purple-600 to-purple-500">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/placeholder.svg?height=40&width=100"
              alt="Logo"
              width={100}
              height={40}
              className="mx-auto"
            />
          </Link>
        </div>
        <div className="bg-[#1F1D2B] rounded-3xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Activate Your Email</h2>
          <p className="text-gray-400 mb-6 text-center">
            Please confirm your email address to activate your account.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-white text-center">{email}</p>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-400"
              >
                I agree to the{' '}
                <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                  Terms & Conditions
                </Link>
              </label>
            </div>
            {activationError && (
              <p className="text-red-500 text-center">{activationError}</p>
            )}
            {activationSuccess && (
              <p className="text-green-500 text-center">{activationSuccess}</p>
            )}
            <Button 
              type="submit" 
              className="w-full bg-purple-500 hover:bg-purple-600 text-white transition duration-300"
              disabled={!email || !acceptTerms || isLoading}
            >
              {isLoading ? 'Activating...' : 'Activate Email'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button 
              className="w-full bg-gray-500 hover:bg-gray-600 text-white"
              onClick={handleResendEmail}
              disabled={isResending}
            >
              {isResending ? 'Resending...' : 'Resend Activation Email'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

