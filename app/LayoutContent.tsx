'use client'

import { usePathname } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Hide nav/footer for agent and client routes
  const isAgentRoute = pathname.includes('/agents') || pathname.includes('/clients')

  if (isAgentRoute) {
    return <main>{children}</main>
  }

  return (
    <>
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  )
}
