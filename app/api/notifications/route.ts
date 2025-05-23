import { type NextRequest, NextResponse } from "next/server"
import { getNotifications } from "@/lib/redis"

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const notifications = await getNotifications(userId)
    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
