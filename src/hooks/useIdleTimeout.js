'use client'

import { useEffect, useRef, useCallback } from 'react'

const IDLE_KEY = 'lastActivityTimestamp'
const IDLE_TIMEOUT_MS = 15 * 60 * 1000
const CHECK_INTERVAL_MS = 30 * 1000
const THROTTLE_MS = 10 * 1000

const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'pointerdown',
]

function getNow() {
  return Date.now()
}

function getLastActivity() {
  try {
    const stored = localStorage.getItem(IDLE_KEY)
    return stored ? parseInt(stored, 10) : null
  } catch {
    return null
  }
}

function setLastActivity(timestamp) {
  try {
    localStorage.setItem(IDLE_KEY, String(timestamp))
  } catch {}
}

export function clearIdleTimestamp() {
  try {
    localStorage.removeItem(IDLE_KEY)
  } catch {}
}

export function useIdleTimeout(onTimeout, enabled = true) {
  const lastThrottleWrite = useRef(0)
  const intervalRef = useRef(null)
  const onTimeoutRef = useRef(onTimeout)
  const hasTimedOut = useRef(false)

  useEffect(() => {
    onTimeoutRef.current = onTimeout
  }, [onTimeout])

  const checkExpiry = useCallback(() => {
    if (hasTimedOut.current) return
    const last = getLastActivity()
    if (last && getNow() - last >= IDLE_TIMEOUT_MS) {
      hasTimedOut.current = true
      clearIdleTimestamp()
      onTimeoutRef.current?.()
    }
  }, [])

  const recordActivity = useCallback(() => {
    if (hasTimedOut.current) return
    const now = getNow()
    if (now - lastThrottleWrite.current >= THROTTLE_MS) {
      lastThrottleWrite.current = now
      setLastActivity(now)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    hasTimedOut.current = false

    const last = getLastActivity()
    const now = getNow()

    if (last && now - last >= IDLE_TIMEOUT_MS) {
      hasTimedOut.current = true
      clearIdleTimestamp()
      onTimeoutRef.current?.()
      return
    }

    if (!last) {
      setLastActivity(now)
    }

    lastThrottleWrite.current = now

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, recordActivity, { passive: true })
    )

    intervalRef.current = setInterval(checkExpiry, CHECK_INTERVAL_MS)

    return () => {
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, recordActivity)
      )
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, recordActivity, checkExpiry])
}
