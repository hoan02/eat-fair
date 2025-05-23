"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { getGroupExpenses } from "@/app/groups/actions"
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface ExpenseChartProps {
  groupId: string
  type: "category" | "time"
}

export function ExpenseChart({ groupId, type }: ExpenseChartProps) {
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("month")

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await getGroupExpenses(groupId)
        setExpenses(data || [])
      } catch (error) {
        console.error("Error fetching expenses:", error)
      } finally {
        setLoading(false)
      }
    }

    if (groupId) {
      fetchExpenses()
    }
  }, [groupId])

  if (loading) {
    return <Skeleton className="h-[400px] w-full" />
  }

  if (!expenses || expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{type === "category" ? "Chi tiêu theo danh mục" : "Chi tiêu theo thời gian"}</CardTitle>
          <CardDescription>Chưa có dữ liệu chi tiêu</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Thêm khoản chi tiêu để xem biểu đồ</p>
        </CardContent>
      </Card>
    )
  }

  // Xử lý dữ liệu cho biểu đồ
  let chartData = []

  if (type === "category") {
    // Nhóm chi tiêu theo danh mục
    const categoryMap = expenses.reduce((acc, expense) => {
      const category = expense.category || "Khác"
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += Number(expense.total_price)
      return acc
    }, {})

    chartData = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
    }))

    // Sắp xếp theo giá trị giảm dần
    chartData.sort((a, b) => b.value - a.value)

    // Màu sắc cho biểu đồ tròn
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B", "#6B66FF"]

    return (
      <Card>
        <CardHeader>
          <CardTitle>Chi tiêu theo danh mục</CardTitle>
          <CardDescription>Phân bổ chi tiêu theo các danh mục</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) =>
                    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    )
  } else {
    // Biểu đồ theo thời gian
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chi tiêu theo thời gian</CardTitle>
          <Tabs defaultValue="month" value={period} onValueChange={setPeriod}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="week">Tuần</TabsTrigger>
              <TabsTrigger value="month">Tháng</TabsTrigger>
              <TabsTrigger value="year">Năm</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <TimeChart expenses={expenses} period={period} />
          </div>
        </CardContent>
      </Card>
    )
  }
}

function TimeChart({ expenses, period }) {
  // Lọc và nhóm dữ liệu theo thời gian
  const now = new Date()
  let filteredExpenses = []
  let chartData = []

  if (period === "week") {
    // Lấy dữ liệu 7 ngày gần nhất
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - 6)

    filteredExpenses = expenses.filter((expense) => {
      const expenseDate = parseISO(expense.date)
      return expenseDate >= startDate && expenseDate <= now
    })

    // Tạo mảng các ngày trong tuần
    const days = eachDayOfInterval({ start: startDate, end: now })

    // Nhóm chi tiêu theo ngày
    chartData = days.map((day) => {
      const dayExpenses = filteredExpenses.filter((expense) => isSameDay(parseISO(expense.date), day))

      const total = dayExpenses.reduce((sum, expense) => sum + Number(expense.total_price), 0)

      return {
        name: format(day, "EEE", { locale: vi }),
        value: total,
      }
    })
  } else if (period === "month") {
    // Lấy dữ liệu tháng hiện tại
    const startOfMonthDate = startOfMonth(now)
    const endOfMonthDate = endOfMonth(now)

    filteredExpenses = expenses.filter((expense) => {
      const expenseDate = parseISO(expense.date)
      return expenseDate >= startOfMonthDate && expenseDate <= endOfMonthDate
    })

    // Tạo mảng các ngày trong tháng
    const days = eachDayOfInterval({ start: startOfMonthDate, end: endOfMonthDate })

    // Nhóm chi tiêu theo ngày
    chartData = days.map((day) => {
      const dayExpenses = filteredExpenses.filter((expense) => isSameDay(parseISO(expense.date), day))

      const total = dayExpenses.reduce((sum, expense) => sum + Number(expense.total_price), 0)

      return {
        name: format(day, "dd"),
        value: total,
      }
    })
  } else if (period === "year") {
    // Lấy dữ liệu năm hiện tại
    const currentYear = now.getFullYear()

    filteredExpenses = expenses.filter((expense) => {
      const expenseDate = parseISO(expense.date)
      return expenseDate.getFullYear() === currentYear
    })

    // Nhóm chi tiêu theo tháng
    const monthlyData = Array(12)
      .fill(0)
      .map((_, index) => {
        const monthExpenses = filteredExpenses.filter((expense) => {
          const expenseDate = parseISO(expense.date)
          return expenseDate.getMonth() === index
        })

        const total = monthExpenses.reduce((sum, expense) => sum + Number(expense.total_price), 0)

        return {
          name: format(new Date(currentYear, index, 1), "MMM", { locale: vi }),
          value: total,
        }
      })

    chartData = monthlyData
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis
          tickFormatter={(value) =>
            new Intl.NumberFormat("vi-VN", {
              notation: "compact",
              compactDisplay: "short",
            }).format(value)
          }
        />
        <Tooltip
          formatter={(value) =>
            new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value)
          }
        />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  )
}
