"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ExpenseTrendChartProps {
  groupId: string
}

export function ExpenseTrendChart({ groupId }: ExpenseTrendChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<"week" | "month" | "year">("month")

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch(`/api/groups/${groupId}/expense-trends?period=${period}`)
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error("Error fetching expense trends:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [groupId, period])

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Xu hướng chi tiêu</CardTitle>
          <Tabs defaultValue={period} onValueChange={(value) => setPeriod(value as any)}>
            <TabsList>
              <TabsTrigger value="week">Tuần</TabsTrigger>
              <TabsTrigger value="month">Tháng</TabsTrigger>
              <TabsTrigger value="year">Năm</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-80">
            <span className="text-muted-foreground">Đang tải dữ liệu...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-80">
            <span className="text-muted-foreground">Không có dữ liệu</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="expenses" name="Chi tiêu" stroke="#f43f5e" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="payments" name="Thanh toán" stroke="#0ea5e9" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
