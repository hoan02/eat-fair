import { type NextRequest, NextResponse } from "next/server"
import { markNotificationAsRead } from "@/lib/redis"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const notificationId = params.id
  const { userId } = await request.json()

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    await markNotificationAsRead(userId, notificationId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}
