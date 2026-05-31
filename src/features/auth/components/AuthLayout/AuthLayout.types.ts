import type { ReactNode } from 'react'

export interface AuthLayoutProps {
  children: ReactNode
  footer?: ReactNode
  labelledBy: string
  subtitle: string
  title: string
}
