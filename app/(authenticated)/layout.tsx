import type React from "react"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getCurrentUser } from "@/app/actions"

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <DashboardShell>{children}</DashboardShell>
}
