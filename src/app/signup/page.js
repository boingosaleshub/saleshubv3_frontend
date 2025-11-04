"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import LoadingIcon from "@/components/ui/loading-icon"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Placeholder signup flow
    setTimeout(() => {
      setLoading(false)
    }, 800)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white text-foreground">
      {/* Left branding panel - full height */}
      <section className="relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
        <div className="relative flex h-screen items-center pl-16 pr-12">
          <div className="max-w-lg text-white">
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/logo boingo B_Round_PS FILE.png"
                alt="SalesHub Logo"
                width={44}
                height={44}
                className="rounded-lg"
                priority
              />
              <span className="text-3xl font-bold">SalesHub</span>
            </div>
            <p className="text-white/90 text-base">
              Unlock your project performance with advanced monitoring and analytics
            </p>
          </div>
        </div>
      </section>

      {/* Right: signup form (no header, no container) */}
      <section className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-sm text-muted-foreground">Sign up to start using SalesHub</p>
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

              <div className="space-y-2">
                <label htmlFor="confirm" className="text-sm font-medium">Confirm Password</label>
                <input
                  id="confirm"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || password !== confirm}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-4 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingIcon size={20} />
                    <span>Signing up…</span>
                  </span>
                ) : (
                  "Sign up"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account? {" "}
                <Link href="/login" className="text-primary underline-offset-4 hover:underline">Sign in</Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}