import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/auth/actions"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { GroupSelector } from "@/components/dashboard/group-selector"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { getUserGroups } from "@/app/groups/actions"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const groups = await getUserGroups(user.id)

  // Nếu người dùng chưa có nhóm nào, chuyển hướng đến trang tạo nhóm
  if (!groups || groups.length === 0) {
    redirect("/groups/create")
  }

  // Mặc định chọn nhóm đầu tiên
  const defaultGroupId = groups[0].id

  return (
    <DashboardShell>
      <DashboardHeader heading="Tổng quan" text="Xem tổng quan chi tiêu của nhóm" />
      <div className="grid gap-4">
        <GroupSelector groups={groups} defaultGroupId={defaultGroupId} />
        <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
          <DashboardTabs groupId={defaultGroupId} />
        </Suspense>
      </div>
    </DashboardShell>
  )
}
