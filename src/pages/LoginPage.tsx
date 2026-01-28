import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/projects');
    } else {
      setError('Invalid email or password. Try john.martinez@acco.com with any 6+ character password.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
              <svg
                viewBox="0 0 32 32"
                fill="none"
                className="w-7 h-7"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 22L16 10L24 22"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="16" cy="18" r="2" fill="white" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">ACCO Submittals AI</h1>
          <p className="text-neutral-500 mt-2">AI-powered conformance checking</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-neutral-900">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@acco.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-neutral-900">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-sm text-primary hover:text-primary-dark"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Password reset functionality would be implemented here');
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-neutral-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-neutral-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" loading={isLoading}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </form>

            {/* Demo credentials hint */}
            <div className="mt-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <p className="text-xs text-neutral-500 text-center">
                <strong>Demo:</strong> Use john.martinez@acco.com with any password (6+ chars)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-400 mt-6">
          Built by TechJays for ACCO Engineered Systems
        </p>
      </div>
    </div>
  );
}
