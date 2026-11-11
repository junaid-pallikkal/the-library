import React from 'react'
import { cn } from '@/lib/utils'

interface FlatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  clickable?: boolean
}

export const FlatCard: React.FC<FlatCardProps> = ({
  children,
  className,
  clickable = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-[rgba(25,28,26,0.12)] dark:border-[rgba(242,244,242,0.12)] bg-card text-card-foreground p-5 transition-all',
        clickable && 'cursor-pointer hover:border-forest dark:hover:border-forest/60 hover:shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
