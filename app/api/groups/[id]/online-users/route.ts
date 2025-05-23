import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getOnlineUsers } from "@/lib/redis"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const groupId = params.id

  try {
    // Lấy danh sách user IDs đang online
    const onlineUserIds = await getOnlineUsers(groupId)

    if (onlineUserIds.length === 0) {
      return NextResponse.json([])
    }

    // Lấy thông tin chi tiết của các users
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("users").select("id, full_name, avatar_url").in("id", onlineUserIds)

    if (error) {
      console.error("Error fetching online users:", error)
      return NextResponse.json({ error: "Failed to fetch online users" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error getting online users:", error)
    return NextResponse.json({ error: "Failed to get online users" }, { status: 500 })
  }
}
