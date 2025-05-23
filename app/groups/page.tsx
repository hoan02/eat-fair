"use client"

import { redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/app/auth/actions"
import { getUserGroups } from "@/app/groups/actions"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { format, parseISO } from "date-fns"
import { vi } from "date-fns/locale"

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6 text-center">
              <p className="mb-4 text-muted-foreground">Bạn chưa tham gia nhóm nào</p>
              <div className="flex justify-center gap-4">
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
            </CardContent>
          </Card>
        ) : (
          groups.map((group) => (
            <Card key={group.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={group.avatar_url || "/placeholder.svg"} alt={group.name} />
                    <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {group.role === "owner" && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          <Icons.crown className="h-3 w-3 mr-1" />
                          Trưởng nhóm
                        </Badge>
                      )}
                      {group.role === "admin" && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Icons.crown className="h-3 w-3 mr-1" />
                          Phó nhóm
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                {group.description && <p className="text-sm text-muted-foreground mb-2">{group.description}</p>}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Mã nhóm: {group.group_code}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => navigator.clipboard.writeText(group.group_code)}
                  >
                    <Icons.copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Tham gia: {format(parseISO(group.joined_at), "dd/MM/yyyy", { locale: vi })}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/groups/${group.id}/members`}>
                    <Icons.users className="mr-2 h-4 w-4" />
                    Thành viên
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/dashboard?groupId=${group.id}`}>
                    <Icons.arrowRight className="mr-2 h-4 w-4" />
                    Xem chi tiết
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </DashboardShell>
  )
}
