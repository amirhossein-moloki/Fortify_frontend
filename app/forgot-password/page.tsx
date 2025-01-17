'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';


const images = [
  '/images/fortify_auth1.jpg',
  '/images/fortify_auth2.jpg',
  '/images/fortify_auth3.jpg',
];
export const BASE_URL = 'http://localhost:8000';


export default function ForgotPasswordForm() {
  const [currentImage, setCurrentImage] = useState(0);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const response = await fetch(`${BASE_URL}/api/accounts/password-reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message || 'Password reset email sent. Please check your inbox.');
        setEmail('');
        setIsSuccess(true);
      } else {
        setMessage(result.message || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setMessage('An error occurred while connecting to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2D2A3D] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 bg-[#1F1D2B] rounded-3xl overflow-hidden">
        {/* Left side - Image Carousel */}
        <div className="relative h-[600px] w-full">
          <Link href="/" className="absolute top-4 left-4 z-10">
            <Image
              src="/logo.png?height=40&width=100"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </Link>
          <Link
            href="/"
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-200 transition-colors px-4 py-2 rounded-full bg-white/10"
          >
            Back to website
          </Link>
          <div className="relative h-full w-full">
            {images.map((src, index) => (
              <Image
                key={index}
                src={src}
                alt={`Slide ${index + 1}`}
                fill
                className={`object-cover transition-opacity duration-1000 ${
                  currentImage === index ? 'opacity-100' : 'opacity-0'
                }`}
                priority={index === 0}
              />
            ))}
          </div>
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <h1 className="text-4xl font-bold mb-4">
              Unstoppable Strength,
              <br /> Unbreakable Protection
            </h1>
            <div className="flex gap-2">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full ${
                    currentImage === index ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-white mb-2">Forgot Password</h2>
            <p className="text-gray-400 mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {message && (
              <p className={`mb-4 ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                {message}
              </p>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#2D2A3D] border-0 text-white placeholder:text-gray-400"
                required
              />
              <Button
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Reset Password'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Link href="/login" className="text-purple-400 hover:text-purple-300">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

