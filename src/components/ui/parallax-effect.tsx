'use client'

import { useEffect, useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ParallaxEffectProps {
  children: ReactNode
  className?: string
  intensity?: number
  reverse?: boolean
}

export function ParallaxEffect({
  children,
  className,
  intensity = 20,
  reverse = false,
}: ParallaxEffectProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Get the mouse position relative to the window
      const x = e.clientX / window.innerWidth - 0.5
      const y = e.clientY / window.innerHeight - 0.5

      // Apply the reverse effect if needed
      const factor = reverse ? -1 : 1

      // Set the position with the intensity factor
      setPosition({
        x: x * intensity * factor,
        y: y * intensity * factor,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [intensity, reverse])

  return (
    <div
      className={cn('transition-transform duration-200 ease-out', className)}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {children}
    </div>
  )
}
