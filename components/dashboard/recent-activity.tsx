"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icons } from "@/components/icons"
import { getGroupExpenses, getGroupPayments } from "@/app/groups/actions"

interface RecentActivityProps {
  groupId: string
}

export function RecentActivity({ groupId }: RecentActivityProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [expenses, setExpenses] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesData, paymentsData] = await Promise.all([
          getGroupExpenses(groupId, 10),
          getGroupPayments(groupId, 10),
        ])
        setExpenses(expensesData || [])
        setPayments(paymentsData || [])
      } catch (error) {
        console.error("Error fetching activity data:", error)
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

  // Kết hợp và sắp xếp hoạt động
  const allActivities = [
    ...expenses.map((expense) => ({
      ...expense,
      type: "expense",
      date: expense.date,
      amount: expense.total_price,
    })),
    ...payments.map((payment) => ({
      ...payment,
      type: "payment",
      date: payment.payment_date,
      amount: payment.amount,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Lọc theo tab
  const filteredActivities =
    activeTab === "all" ? allActivities : allActivities.filter((activity) => activity.type === activeTab)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoạt động gần đây</CardTitle>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="expense">Chi tiêu</TabsTrigger>
            <TabsTrigger value="payment">Thanh toán</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Chưa có hoạt động nào</p>
          ) : (
            filteredActivities.slice(0, 10).map((activity) => (
              <div key={`${activity.type}-${activity.id}`} className="flex items-start space-x-4">
                <div className="mt-1">
                  {activity.type === "expense" ? (
                    <div className="bg-red-100 p-2 rounded-full">
                      <Icons.receipt className="h-4 w-4 text-red-600" />
                    </div>
                  ) : (
                    <div className="bg-green-100 p-2 rounded-full">
                      <Icons.creditCard className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium">
                        {activity.type === "expense" ? activity.food_item : "Thanh toán"}
                      </p>
                      <span className="ml-2">
                        <Badge variant="outline" className="text-xs">
                          {activity.type === "expense" ? "Chi tiêu" : "Thanh toán"}
                        </Badge>
                      </span>
                    </div>
                    <p
                      className={`text-sm font-medium ${activity.type === "expense" ? "text-red-600" : "text-green-600"}`}
                    >
                      {activity.type === "expense" ? "-" : "+"}
                      {formatCurrency(activity.amount)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Avatar className="h-5 w-5 mr-1">
                        <AvatarImage
                          src={activity.user?.avatar_url || "/placeholder.svg"}
                          alt={activity.user?.full_name}
                        />
                        <AvatarFallback>{activity.user?.full_name?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <span>{activity.user?.full_name || "Không xác định"}</span>
                    </div>
                    <span>{format(parseISO(activity.date), "dd/MM/yyyy")}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
