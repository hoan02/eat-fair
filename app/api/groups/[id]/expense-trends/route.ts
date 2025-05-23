import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const groupId = params.id
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "week" // week, month, year

  try {
    const supabase = createServerSupabaseClient()

    // Tính toán ngày bắt đầu dựa trên period
    const now = new Date()
    let startDate: Date

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Lấy chi tiêu trong khoảng thời gian
    const { data: expenses, error } = await supabase
      .from("expenses")
      .select("date, total_price")
      .eq("group_id", groupId)
      .gte("date", startDate.toISOString())
      .order("date", { ascending: true })

    if (error) {
      console.error("Error fetching expenses:", error)
      throw new Error("Failed to fetch expenses")
    }

    if (!expenses || expenses.length === 0) {
      return NextResponse.json([])
    }

    // Nhóm chi tiêu theo ngày
    const dailyExpenses: Record<string, number> = {}

    expenses.forEach((expense) => {
      const date = new Date(expense.date).toISOString().split("T")[0]
      const amount = Number(expense.total_price)

      if (dailyExpenses[date]) {
        dailyExpenses[date] += amount
      } else {
        dailyExpenses[date] = amount
      }
    })

    // Chuyển đổi thành mảng và sắp xếp theo ngày
    const result = Object.entries(dailyExpenses)
      .map(([date, amount]) => ({
        date,
        amount,
        formattedDate: new Date(date).toLocaleDateString("vi-VN"),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error getting expense trends:", error)
    return NextResponse.json({ error: "Failed to get expense trends" }, { status: 500 })
  }
}
