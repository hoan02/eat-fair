import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/auth/actions"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { JoinGroupForm } from "@/components/groups/join-group-form"

export default async function JoinGroupPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Tham gia nhóm" text="Tham gia vào một nhóm chi tiêu hiện có" />
      <div className="grid gap-8">
        <JoinGroupForm />
      </div>
    </DashboardShell>
  )
}
