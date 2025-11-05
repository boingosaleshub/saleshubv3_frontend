"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import BoingoGradientButton from "@/components/ui/boingo-gradient-button"
import LoadingIcon from "@/components/ui/loading-icon"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Placeholder login flow
    setTimeout(() => {
      setLoading(false)
    }, 800)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white text-foreground">
      {/* Left: responsive image panel */}
      <section className="relative hidden lg:block min-h-screen">
        <Image
          src="/login.jpg"
          alt="Login page visual"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </section>

      {/* Right: login form (no header, no container) */}
      <section className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
          <div className="mb-6 text-center">
            <Image
              src="/logo boingo B_Round_PS FILE.png"
              alt="Boingo Logo"
              width={60}
              height={60}
              className="mx-auto mb-3 rounded-lg"
              priority
            />
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to continue to SalesHub</p>
          </div>

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
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded-sm border border-input" />
                  Remember me
                </label>
                <Link href="#" className="text-sm text-primary underline-offset-4 hover:underline">
                  Forgot password?
                </Link>
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

              <p className="text-center text-sm text-muted-foreground">
                Don’t have an account? {" "}
                <Link href="/signup" className="text-primary underline-offset-4 hover:underline">Sign up</Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}