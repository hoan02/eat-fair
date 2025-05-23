import type React from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions"

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
