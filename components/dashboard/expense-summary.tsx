"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Icons } from "@/components/icons"
import { getGroupSummary } from "@/app/groups/actions"

interface ExpenseSummaryProps {
  groupId: string
}

export function ExpenseSummary({ groupId }: ExpenseSummaryProps) {
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getGroupSummary(groupId)
        setSummary(data)
      } catch (error) {
        console.error("Error fetching summary:", error)
      } finally {
        setLoading(false)
      }
    }

    if (groupId) {
      fetchSummary()
    }
  }, [groupId])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  if (loading) {
    return (
      <>
        <Skeleton className="h-[125px] w-full" />
        <Skeleton className="h-[125px] w-full" />
        <Skeleton className="h-[125px] w-full" />
        <Skeleton className="h-[125px] w-full" />
      </>
    )
  }

  if (!summary) {
    return (
      <Card className="col-span-4">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Không thể tải dữ liệu tổng quan</p>
        </CardContent>
      </Card>
    )
  }

  const completedMembers =
    summary.memberCount > 0 ? Object.values(summary.memberBalances).filter((b: any) => b.balance >= 0).length : 0

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng chi tiêu</CardTitle>
          <Icons.receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">
            {summary.memberCount} thành viên,{" "}
            {summary.memberCount > 0 ? formatCurrency(summary.totalExpenses / summary.memberCount) : formatCurrency(0)}
            /người
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đã thanh toán</CardTitle>
          <Icons.creditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalPayments)}</div>
          <p className="text-xs text-muted-foreground">
            {summary.totalExpenses > 0 ? ((summary.totalPayments / summary.totalExpenses) * 100).toFixed(1) : 0}% tổng
            chi tiêu
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Còn thiếu</CardTitle>
          <Icons.arrowRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.remainingAmount)}</div>
          <p className="text-xs text-muted-foreground">
            {summary.totalExpenses > 0 ? ((summary.remainingAmount / summary.totalExpenses) * 100).toFixed(1) : 0}% tổng
            chi tiêu
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Thành viên</CardTitle>
          <Icons.users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.memberCount}</div>
          <p className="text-xs text-muted-foreground">{completedMembers} đã thanh toán đủ</p>
        </CardContent>
      </Card>
    </>
  )
}
