"use client"

import Image from "next/image"

export default function LoadingIcon({ size = 20, alt = "Loading", className }) {
  return (
    <Image
      src="/success.gif"
      alt={alt}
      width={size}
      height={size}
      unoptimized
      className={className}
    />
  )
}