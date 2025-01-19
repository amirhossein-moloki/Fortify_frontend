'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const images = [
  '/images/fortify_auth1.jpg',
  '/images/fortify_auth2.jpg',
  '/images/fortify_auth3.jpg',
];

const validatePassword = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
  return strength;
};

const PasswordStrengthIndicator: React.FC<{ strength: number }> = ({ strength }) => {
  const getColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getMessage = () => {
    if (strength <= 2) return 'Weak';
    if (strength <= 4) return 'Moderate';
    return 'Strong';
  };

  return (
    <div className="mt-2">
      <div className="h-2 w-full bg-gray-300 rounded-full">
        <div
          className={`h-full ${getColor()} rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${(strength / 6) * 100}%` }}
        ></div>
      </div>
      <p className={`text-sm mt-1 ${getColor().replace('bg-', 'text-')}`}>
        Password Strength: {getMessage()}
      </p>
    </div>
  );
};

export const getServerSideProps = async ({ params }: { params: { uidb64: string; token: string } }) => {
  return {
    props: {
      uidb64: params.uidb64,
      token: params.token,
    },
  };
};

const PasswordResetPage = ({ uidb64, token }: { uidb64: string; token: string }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(newPassword));
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!validatePassword(newPassword)) {
      setMessage("New password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirmation do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.BASE_URL}/api/accounts/password-reset-confirm/${uidb64}/${token}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Password changed successfully! Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setMessage(data.message || 'Failed to change password. Please try again.');
      }
    } catch (err) {
      setMessage('An error occurred. Please try again.');
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
              Reset Your Password,
              <br /> Secure Your Account
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
            <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-gray-400 mb-8">
              Please enter your new password.
            </p>

            {message && <p className={`mb-4 ${message.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[#2D2A3D] border-0 text-white placeholder:text-gray-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  {showNewPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <PasswordStrengthIndicator strength={passwordStrength} />
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#2D2A3D] border-0 text-white placeholder:text-gray-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <Button
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
