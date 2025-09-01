import React from 'react'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "src/components/ui/toaster";
import { Toaster as Sonner } from "src/components/ui/sonner";
import { TooltipProvider } from "src/components/ui/tooltip";
import type { PageContext } from './types'
import 'src/index.css'

const queryClient = new QueryClient();

export { PageShell }

function PageShell({ children, pageContext }: { children: React.ReactNode; pageContext: PageContext }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  )
}