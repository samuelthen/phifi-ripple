'use client';

import AuthForm from '@/components/auth/AuthForm';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Sign in to access your dashboard</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
} 