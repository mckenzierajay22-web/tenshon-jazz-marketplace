import {
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import * as React from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { Navbar } from '../components/Navbar'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  notFoundComponent: () => <div>Route not found</div>,
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="antialiased">
      <Navbar />
      <main className="min-h-screen bg-zinc-950">
        <Outlet />
      </main>
    </div>
  )
}
