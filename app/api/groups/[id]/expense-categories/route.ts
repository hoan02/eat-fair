import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getWithCache } from "@/lib/redis"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const groupId = params.id

  const cacheKey = `group:${groupId}:expense-categories`

  try {
    const data = await getWithCache(
      cacheKey,
      async () => {
        const supabase = createServerSupabaseClient()

        // Lấy tất cả chi tiêu trong nhóm
        const { data: expenses, error } = await supabase
          .from("expenses")
          .select("food_item, total_price")
          .eq("group_id", groupId)

        if (error) {
          console.error("Error fetching expenses:", error)
          throw new Error("Failed to fetch expenses")
        }

        if (!expenses || expenses.length === 0) {
          return []
        }

        // Nhóm chi tiêu theo food_item
        const categories: Record<string, number> = {}
        let total = 0

        expenses.forEach((expense) => {
          const amount = Number(expense.total_price)
          total += amount

          if (categories[expense.food_item]) {
            categories[expense.food_item] += amount
          } else {
            categories[expense.food_item] = amount
          }
        })

        // Chuyển đổi thành mảng và sắp xếp theo giá trị giảm dần
        const result = Object.entries(categories)
          .map(([name, value]) => ({
            name,
            value,
            percent: ((value / total) * 100).toFixed(1) + "%",
          }))
          .sort((a, b) => b.value - a.value)

        // Giới hạn số lượng danh mục hiển thị (lấy top 10)
        const topCategories = result.slice(0, 10)

        // Nếu có nhiều hơn 10 danh mục, gộp các danh mục còn lại vào "Khác"
        if (result.length > 10) {
          const otherValue = result.slice(10).reduce((sum, item) => sum + item.value, 0)

          topCategories.push({
            name: "Khác",
            value: otherValue,
            percent: ((otherValue / total) * 100).toFixed(1) + "%",
          })
        }

        return topCategories
      },
      60 * 30, // Cache trong 30 phút
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error getting expense categories:", error)
    return NextResponse.json({ error: "Failed to get expense categories" }, { status: 500 })
  }
}
