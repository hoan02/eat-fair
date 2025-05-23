"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { trackUserOnline } from "@/lib/redis"

interface User {
  id: string
  full_name: string
  avatar_url?: string
}

interface OnlineUsersProps {
  groupId: string
  currentUserId: string
}

export function OnlineUsers({ groupId, currentUserId }: OnlineUsersProps) {
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Track current user as online
  useEffect(() => {
    // Update online status every minute
    const updateOnlineStatus = async () => {
      try {
        await trackUserOnline(currentUserId, groupId)
      } catch (error) {
        console.error("Error tracking online status:", error)
      }
    }

    // Initial update
    updateOnlineStatus()

    // Set interval for updates
    const interval = setInterval(updateOnlineStatus, 60000)

    return () => clearInterval(interval)
  }, [currentUserId, groupId])

  // Fetch online users
  useEffect(() => {
    async function fetchOnlineUsers() {
      try {
        setLoading(true)
        const response = await fetch(`/api/groups/${groupId}/online-users`)
        if (response.ok) {
          const data = await response.json()
          setOnlineUsers(data)
        }
      } catch (error) {
        console.error("Error fetching online users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOnlineUsers()

    // Polling for online users every 30 seconds
    const interval = setInterval(fetchOnlineUsers, 30000)
    return () => clearInterval(interval)
  }, [groupId])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Thành viên đang online</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-2">
            <span className="text-sm text-muted-foreground">Đang tải...</span>
          </div>
        ) : onlineUsers.length === 0 ? (
          <div className="flex items-center justify-center py-2">
            <span className="text-sm text-muted-foreground">Không có thành viên nào đang online</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {onlineUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-1">
                <div className="relative">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.full_name} />
                    <AvatarFallback className="text-xs">{user.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-1 ring-white" />
                </div>
                <span className="text-xs">{user.full_name}</span>
                {user.id === currentUserId && (
                  <Badge variant="outline" className="h-4 px-1 text-[10px]">
                    Bạn
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
