import { getMembers, getSummary } from "@/app/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Crown, Check, X } from "lucide-react"

export async function MembersSummary() {
  try {
    const [members, summary] = await Promise.all([getMembers(), getSummary()])

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Thành viên</CardTitle>
          <CardDescription>Tình trạng thanh toán của các thành viên</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!members || members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Chưa có thành viên nào</div>
            ) : (
              members.map((member) => {
                const memberBalance = summary.memberBalances[member.id] || {
                  owed: 0,
                  paid: 0,
                  balance: 0,
                }

                return (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.name}</span>
                          {member.is_group_leader && <Crown className="h-4 w-4 text-yellow-500" title="Trưởng nhóm" />}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Đã trả: {formatCurrency(memberBalance.paid)} / {formatCurrency(memberBalance.owed)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {memberBalance.balance >= 0 ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <Check className="h-3 w-3 mr-1" />
                          Đã đủ
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          <X className="h-3 w-3 mr-1" />
                          Thiếu {formatCurrency(Math.abs(memberBalance.balance))}
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })
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
          <CardTitle>Thành viên</CardTitle>
          <CardDescription>Tình trạng thanh toán của các thành viên</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Không thể tải dữ liệu thành viên</div>
        </CardContent>
      </Card>
    )
  }
}
