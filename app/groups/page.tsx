import { redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/app/auth/actions"
import { getUserGroups } from "@/app/groups/actions"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { GroupsList } from "@/components/groups/groups-list"

export default async function GroupsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const groups = await getUserGroups(user.id)

  return (
    <DashboardShell>
      <DashboardHeader heading="Quản lý nhóm" text="Quản lý các nhóm chi tiêu của bạn">
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/groups/create">
              <Icons.plus className="mr-2 h-4 w-4" />
              Tạo nhóm mới
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/groups/join">
              <Icons.userPlus className="mr-2 h-4 w-4" />
              Tham gia nhóm
            </Link>
          </Button>
        </div>
      </DashboardHeader>

      <GroupsList groups={groups} />
    </DashboardShell>
  )
}
