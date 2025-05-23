import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getWithCache } from "@/lib/redis"
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  addDays,
} from "date-fns"
import { vi } from "date-fns/locale"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const groupId = params.id
  const period = request.nextUrl.searchParams.get("period") || "month"

  const cacheKey = `group:${groupId}:expense-trends:${period}`

  try {
    const data = await getWithCache(
      cacheKey,
      async () => {
        const supabase = createServerSupabaseClient()
        const now = new Date()

        let startDate: Date
        let endDate: Date
        let intervals: Date[]
        let dateFormat: string

        // Xác định khoảng thời gian dựa trên period
        if (period === "week") {
          startDate = startOfWeek(now, { locale: vi })
          endDate = endOfWeek(now, { locale: vi })
          intervals = eachDayOfInterval({ start: startDate, end: endDate })
          dateFormat = "EEE" // Thứ 2, Thứ 3, ...
        } else if (period === "month") {
          startDate = startOfMonth(now)
          endDate = endOfMonth(now)
          // Chia tháng thành các tuần
          intervals = eachWeekOfInterval({ start: startDate, end: endDate }, { locale: vi })
          dateFormat = "'Tuần' w" // Tuần 1, Tuần 2, ...
        } else {
          // year
          startDate = startOfYear(now)
          endDate = endOfYear(now)
          intervals = eachMonthOfInterval({ start: startDate, end: endDate })
          dateFormat = "MMM" // Tháng 1, Tháng 2, ...
        }

        // Lấy dữ liệu chi tiêu
        const { data: expenses, error: expensesError } = await supabase
          .from("expenses")
          .select("date, total_price")
          .eq("group_id", groupId)
          .gte("date", startDate.toISOString())
          .lte("date", endDate.toISOString())

        if (expensesError) {
          console.error("Error fetching expenses:", expensesError)
          throw new Error("Failed to fetch expenses")
        }

        // Lấy dữ liệu thanh toán
        const { data: payments, error: paymentsError } = await supabase
          .from("payments")
          .select("payment_date, amount")
          .eq("group_id", groupId)
          .gte("payment_date", startDate.toISOString())
          .lte("payment_date", endDate.toISOString())

        if (paymentsError) {
          console.error("Error fetching payments:", paymentsError)
          throw new Error("Failed to fetch payments")
        }

        // Tạo dữ liệu cho biểu đồ
        const chartData = intervals.map((interval, index) => {
          let intervalEnd: Date

          if (period === "week") {
            intervalEnd = interval
          } else if (period === "month") {
            // Kết thúc của tuần hoặc cuối tháng (nếu là tuần cuối)
            intervalEnd = index === intervals.length - 1 ? endDate : addDays(interval, 6)
          } else {
            // year
            // Kết thúc của tháng
            intervalEnd = endOfMonth(interval)
          }

          // Tính tổng chi tiêu trong khoảng thời gian
          const intervalExpenses = expenses
            ? expenses
                .filter((expense) => {
                  const expenseDate = new Date(expense.date)
                  return expenseDate >= interval && expenseDate <= intervalEnd
                })
                .reduce((sum, expense) => sum + Number(expense.total_price), 0)
            : 0

          // Tính tổng thanh toán trong khoảng thời gian
          const intervalPayments = payments
            ? payments
                .filter((payment) => {
                  const paymentDate = new Date(payment.payment_date)
                  return paymentDate >= interval && paymentDate <= intervalEnd
                })
                .reduce((sum, payment) => sum + Number(payment.amount), 0)
            : 0

          return {
            name: format(interval, dateFormat, { locale: vi }),
            expenses: intervalExpenses,
            payments: intervalPayments,
          }
        })

        return chartData
      },
      60 * 15, // Cache trong 15 phút
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error getting expense trends:", error)
    return NextResponse.json({ error: "Failed to get expense trends" }, { status: 500 })
  }
}
