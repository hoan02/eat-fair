import { getGroupMembers } from "@/app/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export async function MembersSummary() {
  try {
    const members = await getGroupMembers()

    return (
      <Card>
        <CardHeader>
          <CardTitle>Thành viên nhóm</CardTitle>
          <CardDescription>Danh sách thành viên trong nhóm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!members || members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Chưa có thành viên nào trong nhóm</div>
            ) : (
              members.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user?.avatar_url || "/placeholder.svg"} alt={member.user?.full_name} />
                      <AvatarFallback className="text-xs">{member.user?.full_name?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">
                        {member.nickname || member.user?.full_name || "Không xác định"}
                      </div>
                      <div className="text-xs text-muted-foreground">{member.user?.email}</div>
                    </div>
                  </div>
                  <Badge
                    variant={member.role === "owner" ? "default" : member.role === "admin" ? "secondary" : "outline"}
                  >
                    {member.role === "owner" ? "Trưởng nhóm" : member.role === "admin" ? "Phó nhóm" : "Thành viên"}
                  </Badge>
                </div>
              ))
            )}
            {members && members.length > 5 && (
              <div className="text-center text-sm text-muted-foreground">
                Và {members.length - 5} thành viên khác...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error("Error loading members summary:", error)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thành viên nhóm</CardTitle>
          <CardDescription>Danh sách thành viên trong nhóm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Không thể tải dữ liệu thành viên</div>
        </CardContent>
      </Card>
    )
  }
}
