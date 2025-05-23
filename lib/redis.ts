import { Redis } from "@upstash/redis"

// Khởi tạo Redis client
const redis = new Redis({
  url: process.env.REDIS_URL || process.env.KV_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
})

// Hàm lấy dữ liệu từ cache hoặc từ callback nếu cache miss
export async function getWithCache<T>(
  key: string,
  callback: () => Promise<T>,
  expireInSeconds: number = 60 * 5, // Mặc định 5 phút
): Promise<T> {
  try {
    // Thử lấy dữ liệu từ cache
    const cachedData = await redis.get<T>(key)

    if (cachedData) {
      console.log(`Cache hit for key: ${key}`)
      return cachedData
    }

    // Nếu không có trong cache, gọi callback để lấy dữ liệu
    console.log(`Cache miss for key: ${key}`)
    const data = await callback()

    // Lưu dữ liệu vào cache
    await redis.set(key, data, { ex: expireInSeconds })

    return data
  } catch (error) {
    console.error(`Redis cache error for key ${key}:`, error)
    // Nếu có lỗi với Redis, vẫn trả về dữ liệu từ callback
    return callback()
  }
}

// Hàm xóa cache khi dữ liệu thay đổi
export async function invalidateCache(keys: string | string[]): Promise<void> {
  try {
    const keysToDelete = Array.isArray(keys) ? keys : [keys]

    if (keysToDelete.length === 1) {
      await redis.del(keysToDelete[0])
    } else if (keysToDelete.length > 1) {
      await redis.del(...keysToDelete)
    }

    console.log(`Invalidated cache for keys: ${keysToDelete.join(", ")}`)
  } catch (error) {
    console.error("Error invalidating cache:", error)
  }
}

// Hàm lưu trữ thông báo
export async function storeNotification(
  userId: string,
  notification: {
    id: string
    title: string
    message: string
    type: "info" | "success" | "warning" | "error"
    read: boolean
    createdAt: string
  },
): Promise<void> {
  try {
    const key = `user:${userId}:notifications`

    // Lấy danh sách thông báo hiện tại
    const notifications = (await redis.lrange<typeof notification>(key, 0, -1)) || []

    // Thêm thông báo mới vào đầu danh sách
    await redis.lpush(key, notification)

    // Giới hạn số lượng thông báo lưu trữ (giữ 50 thông báo gần nhất)
    if (notifications.length >= 50) {
      await redis.ltrim(key, 0, 49)
    }
  } catch (error) {
    console.error("Error storing notification:", error)
  }
}

// Hàm lấy danh sách thông báo
export async function getNotifications(userId: string, limit = 10): Promise<any[]> {
  try {
    const key = `user:${userId}:notifications`
    return (await redis.lrange(key, 0, limit - 1)) || []
  } catch (error) {
    console.error("Error getting notifications:", error)
    return []
  }
}

// Hàm đánh dấu thông báo đã đọc
export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  try {
    const key = `user:${userId}:notifications`

    // Lấy danh sách thông báo
    const notifications = (await redis.lrange<any>(key, 0, -1)) || []

    // Tìm và cập nhật thông báo
    const updatedNotifications = notifications.map((notification) => {
      if (notification.id === notificationId) {
        return { ...notification, read: true }
      }
      return notification
    })

    // Xóa danh sách cũ và thêm danh sách mới
    await redis.del(key)

    if (updatedNotifications.length > 0) {
      await redis.rpush(key, ...updatedNotifications)
    }
  } catch (error) {
    console.error("Error marking notification as read:", error)
  }
}

// Hàm theo dõi người dùng online
export async function trackUserOnline(userId: string, groupId: string): Promise<void> {
  try {
    const key = `group:${groupId}:online_users`

    // Thêm user vào set với thời gian hiện tại
    await redis.hset(key, userId, Date.now())

    // Set expire cho key này (30 phút)
    await redis.expire(key, 60 * 30)
  } catch (error) {
    console.error("Error tracking user online:", error)
  }
}

// Hàm lấy danh sách người dùng online
export async function getOnlineUsers(groupId: string): Promise<string[]> {
  try {
    const key = `group:${groupId}:online_users`
    const onlineUsers = (await redis.hgetall<Record<string, number>>(key)) || {}

    // Lọc những người dùng active trong 5 phút gần đây
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000

    return Object.entries(onlineUsers)
      .filter(([_, timestamp]) => timestamp > fiveMinutesAgo)
      .map(([userId]) => userId)
  } catch (error) {
    console.error("Error getting online users:", error)
    return []
  }
}

export default redis
