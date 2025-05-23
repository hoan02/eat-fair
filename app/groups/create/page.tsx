import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/auth/actions"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CreateGroupForm } from "@/components/groups/create-group-form"

export default async function CreateGroupPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Tạo nhóm mới" text="Tạo một nhóm chi tiêu mới" />
      <div className="grid gap-8">
        <CreateGroupForm />
      </div>
    </DashboardShell>
  )
}
