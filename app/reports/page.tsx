import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/auth/actions"
import { getUserGroups } from "@/app/groups/actions"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ReportGenerator } from "@/components/reports/report-generator"

export default async function ReportsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const groups = await getUserGroups(user.id)

  // Nếu người dùng chưa có nhóm nào, chuyển hướng đến trang tạo nhóm
  if (!groups || groups.length === 0) {
    redirect("/groups/create")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Báo cáo" text="Tạo và xuất báo cáo chi tiêu" />
      <div className="grid gap-8">
        <ReportGenerator groups={groups} />
      </div>
    </DashboardShell>
  )
}
