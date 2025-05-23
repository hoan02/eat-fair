"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Icons } from "@/components/icons"
import { getGroupMembers, getGroupSummary } from "@/app/groups/actions"

interface MemberSummaryProps {
  groupId: string
  detailed?: boolean
}

export function MemberSummary({ groupId, detailed = false }: MemberSummaryProps) {
  const [members, setMembers] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersData, summaryData] = await Promise.all([getGroupMembers(groupId), getGroupSummary(groupId)])
        setMembers(membersData || [])
        setSummary(summaryData)
      } catch (error) {
        console.error("Error fetching member data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (groupId) {
      fetchData()
    }
  }, [groupId])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  if (loading) {
    return <Skeleton className="h-[400px] w-full" />
  }

  if (!members || members.length === 0 || !summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thành viên</CardTitle>
          <CardDescription>Chưa có dữ liệu thành viên</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Thêm thành viên vào nhóm để xem thông tin</p>
        </CardContent>
      </Card>
    )
  }

  // Tính toán trạng thái thanh toán của mỗi thành viên
  const memberPaymentStatus = members.map((member) => {
    const memberBalance = summary.memberBalances[member.user_id] || {
      owed: 0,
      paid: 0,
      balance: 0,
    }

    const paymentPercentage =
      memberBalance.owed > 0 ? Math.min(100, (memberBalance.paid / memberBalance.owed) * 100) : 0

    return {
      ...member,
      owed: memberBalance.owed,
      paid: memberBalance.paid,
      balance: memberBalance.balance,
      paymentPercentage,
    }
  })

  // Sắp xếp theo trạng thái thanh toán (người chưa thanh toán đủ lên đầu)
  memberPaymentStatus.sort((a, b) => {
    if (a.balance < 0 && b.balance >= 0) return -1
    if (a.balance >= 0 && b.balance < 0) return 1
    return b.owed - a.owed
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thành viên</CardTitle>
        <CardDescription>Tình trạng thanh toán của các thành viên</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {memberPaymentStatus.map((member) => (
            <div key={member.id} className={`p-3 border rounded-lg ${detailed ? "space-y-3" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={member.avatar_url || "/placeholder.svg"}
                      alt={member.nickname || member.user.full_name}
                    />
                    <AvatarFallback className="text-xs">
                      {(member.nickname || member.user.full_name).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.nickname || member.user.full_name}</span>
                      {member.role === "owner" && (
                        <Icons.crown className="h-4 w-4 text-yellow-500" title="Trưởng nhóm" />
                      )}
                      {member.role === "admin" && <Icons.crown className="h-4 w-4 text-blue-500" title="Phó nhóm" />}
                    </div>
                    {!detailed && (
                      <div className="text-xs text-muted-foreground">
                        Đã trả: {formatCurrency(member.paid)} / {formatCurrency(member.owed)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {member.balance >= 0 ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Icons.check className="h-3 w-3 mr-1" />
                      Đã đủ
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      <Icons.close className="h-3 w-3 mr-1" />
                      Thiếu {formatCurrency(Math.abs(member.balance))}
                    </Badge>
                  )}
                </div>
              </div>

              {detailed && (
                <>
                  <Progress value={member.paymentPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Đã trả: {formatCurrency(member.paid)}</span>
                    <span>Cần trả: {formatCurrency(member.owed)}</span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
