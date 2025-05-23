import { type NextRequest, NextResponse } from "next/server"
import redis from "@/lib/redis"

export async function POST(request: NextRequest) {
  const { userId } = await request.json()

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const key = `user:${userId}:notifications`

    // Lấy tất cả thông báo
    const notifications = (await redis.lrange<any>(key, 0, -1)) || []

    // Đánh dấu tất cả đã đọc
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }))

    // Xóa danh sách cũ và thêm danh sách mới
    await redis.del(key)

    if (updatedNotifications.length > 0) {
      await redis.rpush(key, ...updatedNotifications)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json({ error: "Failed to mark all notifications as read" }, { status: 500 })
  }
}
