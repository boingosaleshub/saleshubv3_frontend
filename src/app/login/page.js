"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import BoingoGradientButton from "@/components/ui/boingo-gradient-button"
import LoadingIcon from "@/components/ui/loading-icon"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"
import ForgotPasswordFlow from "@/components/auth/ForgotPasswordFlow"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const router = useRouter()
  const { setUser } = useAuthStore()
  const supabase = createClient()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      setUser(data.user)

      toast.success('Login successful!', {
        style: {
          '--normal-bg':
            'color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))',

          '--normal-text': 'light-dark(var(--color-green-600), var(--color-green-400))',
          '--normal-border': 'light-dark(var(--color-green-600), var(--color-green-400))'
        }
      })

      // Redirect to dashboard after a short delay to show the toast
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } else {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white text-foreground">
      {/* Left: responsive image panel */}
      <section className="relative hidden lg:block min-h-screen bg-black">
        <Image
          src="/login.png"
          alt="Login page visual"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain"
        />
      </section>

      {/* Right: login form or forgot password flow */}
      <section className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
          <div className="mb-6 text-center">
            <Image
              src="/SalesHub 2.0 Logo Text.png"
              alt="SalesHub Logo"
              width={450}
              height={450}
              className="mx-auto mb-6"
              priority
            />
          </div>

          {showForgotPassword ? (
            <ForgotPasswordFlow onBackToLogin={() => setShowForgotPassword(false)} />
          ) : (
            <div className="rounded-xl border bg-card text-card-foreground shadow-lg">
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none p-1 rounded-md transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded-sm border border-input" />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <BoingoGradientButton
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 px-4 py-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingIcon size={20} />
                      <span>Signing in…</span>
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </BoingoGradientButton>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

