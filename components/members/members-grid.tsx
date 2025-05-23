import { getMembers, getSummary } from "@/app/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Crown, Check, X, Phone, MapPin, Mail } from "lucide-react"
import { DeleteMemberDialog } from "./delete-member-dialog"

export async function MembersGrid() {
  try {
    const [members, summary] = await Promise.all([getMembers(), getSummary()])

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {!members || members.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">Chưa có thành viên nào</div>
        ) : (
          members.map((member) => {
            const memberBalance = summary.memberBalances[member.id] || {
              owed: 0,
              paid: 0,
              balance: 0,
            }

            return (
              <Card key={member.id} className="hover:shadow-md transition-shadow relative">
                <DeleteMemberDialog member={member} />
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar_url || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback className="text-lg">{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        {member.is_group_leader && <Crown className="h-4 w-4 text-yellow-500" title="Trưởng nhóm" />}
                      </div>
                      <div className="mt-1">
                        {memberBalance.balance >= 0 ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Check className="h-3 w-3 mr-1" />
                            Đã thanh toán đủ
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            <X className="h-3 w-3 mr-1" />
                            Còn thiếu {formatCurrency(Math.abs(memberBalance.balance))}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cần trả:</span>
                      <span className="font-medium">{formatCurrency(memberBalance.owed)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Đã trả:</span>
                      <span className="font-medium text-green-600">{formatCurrency(memberBalance.paid)}</span>
                    </div>
                  </div>

                  {(member.phone || member.email || member.address) && (
                    <div className="pt-3 border-t space-y-2">
                      {member.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{member.email}</span>
                        </div>
                      )}
                      {member.address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{member.address}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    )
  } catch (error) {
    console.error("Error loading members grid:", error)
    return <div className="text-center py-8 text-muted-foreground">Không thể tải dữ liệu thành viên</div>
  }
}
