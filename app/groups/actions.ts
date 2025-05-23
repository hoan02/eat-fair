"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getWithCache, invalidateCache } from "@/lib/redis"
import { getCurrentUser } from "@/app/auth/actions"
import { redirect } from "next/navigation"

// Lấy danh sách nhóm của người dùng
export async function getUserGroups(userId: string) {
  const cacheKey = `user:${userId}:groups`

  return getWithCache(
    cacheKey,
    async () => {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from("group_members")
        .select(`
          id,
          role,
          nickname,
          joined_at,
          group:groups (
            id,
            name,
            description,
            group_code,
            avatar_url,
            created_at
          )
        `)
        .eq("user_id", userId)
        .order("joined_at", { ascending: false })

      if (error) {
        console.error("Error fetching user groups:", error)
        return []
      }

      // Chuyển đổi dữ liệu để dễ sử dụng hơn
      return (
        data.map((item) => ({
          id: item.group.id,
          name: item.group.name,
          description: item.group.description,
          group_code: item.group.group_code,
          avatar_url: item.group.avatar_url,
          created_at: item.group.created_at,
          role: item.role,
          nickname: item.nickname,
          joined_at: item.joined_at,
        })) || []
      )
    },
    60 * 15, // Cache trong 15 phút
  )
}

// Lấy thông tin chi tiết của nhóm
export async function getGroupDetails(groupId: string) {
  const cacheKey = `group:${groupId}:details`

  return getWithCache(
    cacheKey,
    async () => {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from("groups")
        .select(`
          *,
          creator:users!created_by (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq("id", groupId)
        .single()

      if (error) {
        console.error("Error fetching group details:", error)
        throw new Error("Failed to fetch group details")
      }

      return data
    },
    60 * 30, // Cache trong 30 phút
  )
}

// Lấy danh sách thành viên trong nhóm
export async function getGroupMembers(groupId: string) {
  const cacheKey = `group:${groupId}:members`

  return getWithCache(
    cacheKey,
    async () => {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from("group_members")
        .select(`
          *,
          user:users (
            id,
            full_name,
            email,
            avatar_url,
            phone
          )
        `)
        .eq("group_id", groupId)
        .order("role", { ascending: true })
        .order("joined_at", { ascending: true })

      if (error) {
        console.error("Error fetching group members:", error)
        return []
      }

      return data || []
    },
    60 * 10, // Cache trong 10 phút
  )
}

// Lấy danh sách chi tiêu của nhóm
export async function getGroupExpenses(groupId: string, limit?: number) {
  const cacheKey = `group:${groupId}:expenses${limit ? `:${limit}` : ""}`

  return getWithCache(
    cacheKey,
    async () => {
      const supabase = createServerSupabaseClient()

      let query = supabase
        .from("expenses")
        .select(`
          *,
          user:created_by (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("group_id", groupId)
        .order("date", { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching group expenses:", error)
        return []
      }

      return data || []
    },
    60 * 5, // Cache trong 5 phút
  )
}

// Lấy danh sách thanh toán của nhóm
export async function getGroupPayments(groupId: string, limit?: number) {
  const cacheKey = `group:${groupId}:payments${limit ? `:${limit}` : ""}`

  return getWithCache(
    cacheKey,
    async () => {
      const supabase = createServerSupabaseClient()

      let query = supabase
        .from("payments")
        .select(`
          *,
          user:user_id (
            id,
            full_name,
            avatar_url
          ),
          approver:approved_by (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("group_id", groupId)
        .order("payment_date", { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching group payments:", error)
        return []
      }

      return data || []
    },
    60 * 5, // Cache trong 5 phút
  )
}

// Lấy thông tin tổng quan của nhóm
export async function getGroupSummary(groupId: string) {
  const cacheKey = `group:${groupId}:summary`

  return getWithCache(
    cacheKey,
    async () => {
      const supabase = createServerSupabaseClient()

      try {
        // Lấy tổng chi tiêu
        const { data: expenses, error: expensesError } = await supabase
          .from("expenses")
          .select("total_price, participants")
          .eq("group_id", groupId)

        if (expensesError) {
          console.error("Error fetching expense totals:", expensesError)
          throw new Error("Failed to calculate summary")
        }

        // Lấy tổng thanh toán
        const { data: payments, error: paymentsError } = await supabase
          .from("payments")
          .select("amount")
          .eq("group_id", groupId)

        if (paymentsError) {
          console.error("Error fetching payment totals:", paymentsError)
          throw new Error("Failed to calculate summary")
        }

        // Lấy tất cả thành viên
        const { data: members, error: membersError } = await supabase
          .from("group_members")
          .select("user_id")
          .eq("group_id", groupId)

        if (membersError) {
          console.error("Error counting members:", membersError)
          throw new Error("Failed to calculate summary")
        }

        // Lấy thanh toán theo thành viên
        const { data: paymentsByMember, error: paymentsByMemberError } = await supabase
          .from("payments")
          .select("user_id, amount")
          .eq("group_id", groupId)

        if (paymentsByMemberError) {
          console.error("Error fetching payments by member:", paymentsByMemberError)
          throw new Error("Failed to calculate summary")
        }

        const totalExpenses = expenses?.reduce((sum, expense) => sum + Number(expense.total_price || 0), 0) || 0
        const totalPayments = payments?.reduce((sum, payment) => sum + Number(payment.amount || 0), 0) || 0
        const memberCount = members?.length || 0

        // Khởi tạo chi tiêu và thanh toán của thành viên
        const memberExpenses = {}
        const memberPayments = {}

        if (members) {
          members.forEach((member) => {
            memberExpenses[member.user_id] = 0
            memberPayments[member.user_id] = 0
          })
        }

        // Tính toán chi tiêu cho mỗi thành viên dựa trên participants
        if (expenses && members) {
          expenses.forEach((expense) => {
            // Nếu không có participants, giả định tất cả thành viên tham gia
            const participants =
              expense.participants && expense.participants.length > 0
                ? expense.participants
                : members.map((m) => m.user_id)

            const participantCount = participants.length
            const amountPerParticipant = participantCount > 0 ? Number(expense.total_price || 0) / participantCount : 0

            participants.forEach((participantId) => {
              if (memberExpenses[participantId] !== undefined) {
                memberExpenses[participantId] += amountPerParticipant
              }
            })
          })
        }

        // Tính toán thanh toán cho mỗi thành viên
        if (paymentsByMember) {
          paymentsByMember.forEach((payment) => {
            if (memberPayments[payment.user_id] !== undefined) {
              memberPayments[payment.user_id] += Number(payment.amount || 0)
            }
          })
        }

        // Tính toán số dư của thành viên
        const memberBalances = {}
        if (members) {
          members.forEach((member) => {
            const owed = memberExpenses[member.user_id] || 0
            const paid = memberPayments[member.user_id] || 0
            memberBalances[member.user_id] = {
              owed,
              paid,
              balance: paid - owed,
            }
          })
        }

        const remainingAmount = totalExpenses - totalPayments

        return {
          totalExpenses,
          totalPayments,
          memberCount,
          remainingAmount,
          memberBalances,
        }
      } catch (error) {
        console.error("Error in getGroupSummary:", error)
        // Trả về giá trị mặc định thay vì throw error
        return {
          totalExpenses: 0,
          totalPayments: 0,
          memberCount: 0,
          remainingAmount: 0,
          memberBalances: {},
        }
      }
    },
    60 * 5, // Cache trong 5 phút
  )
}

// Tạo nhóm mới
export async function createGroup(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const avatarFile = formData.get("avatar") as File

  if (!name) {
    return { success: false, error: "Tên nhóm không được để trống" }
  }

  try {
    const supabase = createServerSupabaseClient()

    // Upload avatar nếu có
    let avatarUrl = null
    if (avatarFile && avatarFile.size > 0) {
      const filename = `group-avatars/${Date.now()}-${avatarFile.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filename, avatarFile)

      if (uploadError) {
        console.error("Error uploading avatar:", uploadError)
      } else {
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filename)
        avatarUrl = urlData.publicUrl
      }
    }

    // Tạo nhóm mới
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({
        name,
        description,
        avatar_url: avatarUrl,
        created_by: user.id,
      })
      .select()
      .single()

    if (groupError) {
      throw new Error(groupError.message)
    }

    // Thêm người tạo vào nhóm với vai trò owner
    const { error: memberError } = await supabase.from("group_members").insert({
      user_id: user.id,
      group_id: group.id,
      role: "owner",
      nickname: user.full_name,
    })

    if (memberError) {
      throw new Error(memberError.message)
    }

    // Xóa cache liên quan
    await invalidateCache([`user:${user.id}:groups`])

    revalidatePath("/groups")
    revalidatePath("/dashboard")

    return { success: true, groupId: group.id }
  } catch (error) {
    console.error("Error creating group:", error)
    return { success: false, error: "Đã xảy ra lỗi khi tạo nhóm" }
  }
}

// Tham gia nhóm bằng mã
export async function joinGroup(groupCode: string) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  try {
    const supabase = createServerSupabaseClient()

    // Tìm nhóm theo mã
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("id")
      .eq("group_code", groupCode)
      .single()

    if (groupError || !group) {
      return { success: false, error: "Mã nhóm không hợp lệ" }
    }

    // Kiểm tra xem người dùng đã trong nhóm chưa
    const { data: existingMember, error: memberCheckError } = await supabase
      .from("group_members")
      .select("id")
      .eq("user_id", user.id)
      .eq("group_id", group.id)
      .maybeSingle()

    if (existingMember) {
      return { success: false, error: "Bạn đã là thành viên của nhóm này" }
    }

    // Thêm người dùng vào nhóm
    const { error: joinError } = await supabase.from("group_members").insert({
      user_id: user.id,
      group_id: group.id,
      role: "member",
      nickname: user.full_name,
    })

    if (joinError) {
      throw new Error(joinError.message)
    }

    // Xóa cache liên quan
    await invalidateCache([`user:${user.id}:groups`, `group:${group.id}:members`])

    revalidatePath("/groups")
    revalidatePath("/dashboard")

    return { success: true, groupId: group.id }
  } catch (error) {
    console.error("Error joining group:", error)
    return { success: false, error: "Đã xảy ra lỗi khi tham gia nhóm" }
  }
}

// Cập nhật vai trò thành viên
export async function updateMemberRole(memberId: string, role: "owner" | "admin" | "member") {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  try {
    const supabase = createServerSupabaseClient()

    // Lấy thông tin thành viên
    const { data: member, error: memberError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("id", memberId)
      .single()

    if (memberError || !member) {
      return { success: false, error: "Không tìm thấy thành viên" }
    }

    // Kiểm tra quyền của người dùng hiện tại
    const { data: currentUserMember, error: currentUserError } = await supabase
      .from("group_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("group_id", member.group_id)
      .single()

    if (currentUserError || !currentUserMember) {
      return { success: false, error: "Bạn không phải là thành viên của nhóm này" }
    }

    // Chỉ owner mới có thể thay đổi vai trò
    if (currentUserMember.role !== "owner") {
      return { success: false, error: "Bạn không có quyền thay đổi vai trò thành viên" }
    }

    // Cập nhật vai trò
    const { error: updateError } = await supabase.from("group_members").update({ role }).eq("id", memberId)

    if (updateError) {
      throw new Error(updateError.message)
    }

    // Xóa cache liên quan
    await invalidateCache([`group:${member.group_id}:members`])

    revalidatePath(`/groups/${member.group_id}/members`)

    return { success: true }
  } catch (error) {
    console.error("Error updating member role:", error)
    return { success: false, error: "Đã xảy ra lỗi khi cập nhật vai trò thành viên" }
  }
}

// Xóa thành viên khỏi nhóm
export async function removeMemberFromGroup(memberId: string) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  try {
    const supabase = createServerSupabaseClient()

    // Lấy thông tin thành viên
    const { data: member, error: memberError } = await supabase
      .from("group_members")
      .select("group_id, role, user_id")
      .eq("id", memberId)
      .single()

    if (memberError || !member) {
      return { success: false, error: "Không tìm thấy thành viên" }
    }

    // Kiểm tra quyền của người dùng hiện tại
    const { data: currentUserMember, error: currentUserError } = await supabase
      .from("group_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("group_id", member.group_id)
      .single()

    if (currentUserError || !currentUserMember) {
      return { success: false, error: "Bạn không phải là thành viên của nhóm này" }
    }

    // Chỉ owner và admin mới có thể xóa thành viên
    if (currentUserMember.role !== "owner" && currentUserMember.role !== "admin") {
      return { success: false, error: "Bạn không có quyền xóa thành viên" }
    }

    // Admin không thể xóa owner hoặc admin khác
    if (currentUserMember.role === "admin" && (member.role === "owner" || member.role === "admin")) {
      return { success: false, error: "Bạn không có quyền xóa trưởng nhóm hoặc phó nhóm" }
    }

    // Owner không thể tự xóa mình
    if (currentUserMember.role === "owner" && member.user_id === user.id) {
      return { success: false, error: "Trưởng nhóm không thể tự xóa mình khỏi nhóm" }
    }

    // Xóa thành viên
    const { error: deleteError } = await supabase.from("group_members").delete().eq("id", memberId)

    if (deleteError) {
      throw new Error(deleteError.message)
    }

    // Xóa cache liên quan
    await invalidateCache([`group:${member.group_id}:members`, `user:${member.user_id}:groups`])

    revalidatePath(`/groups/${member.group_id}/members`)

    return { success: true }
  } catch (error) {
    console.error("Error removing member:", error)
    return { success: false, error: "Đã xảy ra lỗi khi xóa thành viên" }
  }
}

// Xuất báo cáo chi tiêu
export async function generateExpenseReport(groupId: string, period: "week" | "month" | "year") {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  try {
    const supabase = createServerSupabaseClient()

    // Lấy thông tin nhóm
    const { data: group, error: groupError } = await supabase.from("groups").select("name").eq("id", groupId).single()

    if (groupError || !group) {
      return { success: false, error: "Không tìm thấy nhóm" }
    }

    // Lấy dữ liệu chi tiêu và thanh toán
    const [expenses, payments, members, summary] = await Promise.all([
      getGroupExpenses(groupId),
      getGroupPayments(groupId),
      getGroupMembers(groupId),
      getGroupSummary(groupId),
    ])

    // Tạo dữ liệu báo cáo
    const reportData = {
      group: group.name,
      generatedAt: new Date().toISOString(),
      generatedBy: user.full_name,
      period,
      summary: {
        totalExpenses: summary.totalExpenses,
        totalPayments: summary.totalPayments,
        remainingAmount: summary.remainingAmount,
        memberCount: summary.memberCount,
      },
      members: members.map((member) => ({
        name: member.nickname || member.user.full_name,
        role: member.role,
        owed: summary.memberBalances[member.user_id]?.owed || 0,
        paid: summary.memberBalances[member.user_id]?.paid || 0,
        balance: summary.memberBalances[member.user_id]?.balance || 0,
      })),
      expenses: expenses.map((expense) => ({
        date: expense.date,
        item: expense.food_item,
        amount: expense.total_price,
        createdBy: expense.user?.full_name || "Không xác định",
      })),
      payments: payments.map((payment) => ({
        date: payment.payment_date,
        amount: payment.amount,
        method: payment.payment_method,
        user: payment.user?.full_name || "Không xác định",
        status: payment.status,
      })),
    }

    return { success: true, data: reportData }
  } catch (error) {
    console.error("Error generating report:", error)
    return { success: false, error: "Đã xảy ra lỗi khi tạo báo cáo" }
  }
}
