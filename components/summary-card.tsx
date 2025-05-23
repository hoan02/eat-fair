"use client"

import { DollarSign, Users, ArrowRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SummaryCard({ summary, loading }) {
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  if (loading) {
    return (
      <Card className="overflow-hidden border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardTitle>Tổng Kết</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Đang tải dữ liệu...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardTitle>Tổng Kết</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-purple-500" />
            <span>Tổng chi tiêu:</span>
          </div>
          <span className="font-bold text-lg">{formatCurrency(summary.totalExpenses)}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-500" />
            <span>Đã thanh toán:</span>
          </div>
          <span className="font-bold text-lg text-green-600">{formatCurrency(summary.totalPayments)}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <ArrowRight className="h-5 w-5 mr-2 text-orange-500" />
            <span>Còn thiếu:</span>
          </div>
          <span className="font-bold text-lg text-orange-600">{formatCurrency(summary.remainingAmount)}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-purple-500" />
            <span>Số người chia:</span>
          </div>
          <span className="font-bold">{summary.memberCount} người</span>
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <span>Mỗi người cần trả:</span>
          <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            {formatCurrency(summary.amountPerPerson)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
