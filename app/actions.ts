"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// User and Group Member actions
export async function getUsers() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }

  return data || []
}

export async function getGroupMembers(groupId?: string) {
  const supabase = createServerSupabaseClient()

  let query = supabase.from("group_members").select(`
      *,
      user:users(
        id,
        full_name,
        email,
        avatar_url
      ),
      group:groups(
        id,
        name,
        group_code
      )
    `)

  if (groupId) {
    query = query.eq("group_id", groupId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching group members:", error)
    return []
  }

  return data || []
}

// Expense actions
export async function getExpenses(limit?: number, groupId?: string) {
  const supabase = createServerSupabaseClient()

  let query = supabase
    .from("expenses")
    .select(`
      *,
      creator:users!created_by(
        id,
        full_name,
        email,
        avatar_url
      ),
      group:groups(
        id,
        name
      )
    `)
    .order("date", { ascending: false })

  if (groupId) {
    query = query.eq("group_id", groupId)
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching expenses:", error)
    return []
  }

  return data || []
}

export async function getExpenseById(id: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("expenses")
    .select(`
      *,
      creator:users!created_by(
        id,
        full_name,
        email,
        avatar_url
      ),
      group:groups(
        id,
        name
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching expense:", error)
    throw new Error("Failed to fetch expense")
  }

  return data
}

export async function addExpense(expense: {
  date: string
  food_item: string
  quantity: number
  unit_price: number
  total_price: number
  notes?: string
  receipt_image_url?: string
  created_by: string
  group_id: string
  participants?: string[]
}) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("expenses").insert(expense)

  if (error) {
    console.error("Error adding expense:", error)
    throw new Error("Failed to add expense")
  }

  revalidatePath("/expenses")
  revalidatePath("/")
}

export async function updateExpense(
  id: string,
  expense: {
    date?: string
    food_item?: string
    quantity?: number
    unit_price?: number
    total_price?: number
    notes?: string
    receipt_image_url?: string
    participants?: string[]
  },
) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from("expenses")
    .update({ ...expense, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("Error updating expense:", error)
    throw new Error("Failed to update expense")
  }

  revalidatePath("/expenses")
  revalidatePath("/")
}

export async function deleteExpense(id: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("expenses").delete().eq("id", id)

  if (error) {
    console.error("Error deleting expense:", error)
    throw new Error("Failed to delete expense")
  }

  revalidatePath("/expenses")
  revalidatePath("/")
}

// Member actions
export async function getMembers() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("members").select("*")

  if (error) {
    console.error("Error fetching members:", error)
    throw new Error("Failed to fetch members")
  }

  return data
}

export async function getMemberById(id: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("members").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching member:", error)
    throw new Error("Failed to fetch member")
  }

  return data
}

export async function getGroupLeaders() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("members").select("*").eq("is_group_leader", true)

  if (error) {
    console.error("Error fetching group leaders:", error)
    throw new Error("Failed to fetch group leaders")
  }

  return data
}

export async function addMember(member: {
  name: string
  avatar_url?: string
  is_group_leader?: boolean
  phone?: string
  address?: string
  email?: string
}) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("members").insert(member)

  if (error) {
    console.error("Error adding member:", error)
    throw new Error("Failed to add member")
  }

  revalidatePath("/members")
  revalidatePath("/")
}

export async function updateMember(
  id: string,
  member: {
    name?: string
    avatar_url?: string
    is_group_leader?: boolean
    phone?: string
    address?: string
    email?: string
  },
) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("members").update(member).eq("id", id)

  if (error) {
    console.error("Error updating member:", error)
    throw new Error("Failed to update member")
  }

  revalidatePath("/members")
  revalidatePath("/")
}

export async function deleteMember(id: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("members").delete().eq("id", id)

  if (error) {
    console.error("Error deleting member:", error)
    throw new Error("Failed to delete member")
  }

  revalidatePath("/members")
  revalidatePath("/")
}

// Payment actions
export async function getPayments(limit?: number, groupId?: string) {
  const supabase = createServerSupabaseClient()

  let query = supabase
    .from("payments")
    .select(`
      *,
      user:users!user_id(
        id,
        full_name,
        email,
        avatar_url
      ),
      approver:users!approved_by(
        id,
        full_name,
        email,
        avatar_url
      ),
      group:groups(
        id,
        name
      )
    `)
    .order("payment_date", { ascending: false })

  if (groupId) {
    query = query.eq("group_id", groupId)
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching payments:", error)
    return []
  }

  return data || []
}

export async function getPaymentById(id: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      user:users!user_id(
        id,
        full_name,
        email,
        avatar_url
      ),
      approver:users!approved_by(
        id,
        full_name,
        email,
        avatar_url
      ),
      group:groups(
        id,
        name
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching payment:", error)
    throw new Error("Failed to fetch payment")
  }

  return data
}

export async function addPayment(payment: {
  user_id: string
  group_id: string
  amount: number
  payment_date?: string
  payment_method?: string
  payment_proof_url?: string
  notes?: string
  approved_by?: string
}) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("payments").insert({
    ...payment,
    payment_date: payment.payment_date || new Date().toISOString(),
  })

  if (error) {
    console.error("Error adding payment:", error)
    throw new Error("Failed to add payment")
  }

  revalidatePath("/payments")
  revalidatePath("/")
}

export async function updatePayment(
  id: string,
  payment: {
    user_id?: string
    amount?: number
    payment_date?: string
    payment_method?: string
    payment_proof_url?: string
    notes?: string
    approved_by?: string
  },
) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("payments").update(payment).eq("id", id)

  if (error) {
    console.error("Error updating payment:", error)
    throw new Error("Failed to update payment")
  }

  revalidatePath("/payments")
  revalidatePath("/")
}

export async function deletePayment(id: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("payments").delete().eq("id", id)

  if (error) {
    console.error("Error deleting payment:", error)
    throw new Error("Failed to delete payment")
  }

  revalidatePath("/payments")
  revalidatePath("/")
}

export async function approvePayment(id: string, approverId: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("payments").update({ approved_by: approverId }).eq("id", id)

  if (error) {
    console.error("Error approving payment:", error)
    throw new Error("Failed to approve payment")
  }

  revalidatePath("/payments")
  revalidatePath("/")
}

// Food items actions
export async function getFoodItems(category?: string, groupId?: string) {
  const supabase = createServerSupabaseClient()

  let query = supabase.from("food_items").select(`
      *,
      creator:users!created_by(
        id,
        full_name,
        email,
        avatar_url
      ),
      group:groups(
        id,
        name
      )
    `)

  if (category) {
    query = query.eq("category", category)
  }

  if (groupId) {
    query = query.eq("group_id", groupId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching food items:", error)
    return []
  }

  return data || []
}

export async function getFoodItemById(id: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("food_items")
    .select(`
      *,
      creator:users!created_by(
        id,
        full_name,
        email,
        avatar_url
      ),
      group:groups(
        id,
        name
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching food item:", error)
    throw new Error("Failed to fetch food item")
  }

  return data
}

export async function addFoodItem(foodItem: {
  name: string
  default_price: number
  description?: string
  image_url?: string
  category?: string
  group_id: string
  created_by: string
}) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("food_items").insert(foodItem)

  if (error) {
    console.error("Error adding food item:", error)
    throw new Error("Failed to add food item")
  }

  revalidatePath("/food-items")
}

export async function updateFoodItem(
  id: string,
  foodItem: {
    name?: string
    default_price?: number
    description?: string
    image_url?: string
    category?: string
  },
) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("food_items").update(foodItem).eq("id", id)

  if (error) {
    console.error("Error updating food item:", error)
    throw new Error("Failed to update food item")
  }

  revalidatePath("/food-items")
}

export async function deleteFoodItem(id: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("food_items").delete().eq("id", id)

  if (error) {
    console.error("Error deleting food item:", error)
    throw new Error("Failed to delete food item")
  }

  revalidatePath("/food-items")
}

// Summary calculations
export async function getSummary(groupId?: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Get total expenses for the group
    let expensesQuery = supabase.from("expenses").select("total_price, participants")
    if (groupId) {
      expensesQuery = expensesQuery.eq("group_id", groupId)
    }
    const { data: expenses, error: expensesError } = await expensesQuery

    if (expensesError) {
      console.error("Error fetching expense totals:", expensesError)
    }

    // Get total payments for the group
    let paymentsQuery = supabase.from("payments").select("amount, user_id")
    if (groupId) {
      paymentsQuery = paymentsQuery.eq("group_id", groupId)
    }
    const { data: payments, error: paymentsError } = await paymentsQuery

    if (paymentsError) {
      console.error("Error fetching payment totals:", paymentsError)
    }

    // Get all group members
    let membersQuery = supabase.from("group_members").select("user_id")
    if (groupId) {
      membersQuery = membersQuery.eq("group_id", groupId)
    }
    const { data: members, error: membersError } = await membersQuery

    if (membersError) {
      console.error("Error counting members:", membersError)
    }

    const totalExpenses = expenses?.reduce((sum, expense) => sum + Number(expense.total_price || 0), 0) || 0
    const totalPayments = payments?.reduce((sum, payment) => sum + Number(payment.amount || 0), 0) || 0
    const memberCount = members?.length || 0

    // Initialize member expenses and payments
    const memberExpenses = {}
    const memberPayments = {}

    if (members) {
      members.forEach((member) => {
        memberExpenses[member.user_id] = 0
        memberPayments[member.user_id] = 0
      })
    }

    // Calculate expenses per member based on participants
    if (expenses && members) {
      expenses.forEach((expense) => {
        // If no participants specified, assume all members participate
        const participants =
          expense.participants && expense.participants.length > 0 ? expense.participants : members.map((m) => m.user_id)

        const participantCount = participants.length
        const amountPerParticipant = participantCount > 0 ? Number(expense.total_price || 0) / participantCount : 0

        participants.forEach((participantId) => {
          if (memberExpenses[participantId] !== undefined) {
            memberExpenses[participantId] += amountPerParticipant
          }
        })
      })
    }

    // Calculate payments per member
    if (payments) {
      payments.forEach((payment) => {
        if (memberPayments[payment.user_id] !== undefined) {
          memberPayments[payment.user_id] += Number(payment.amount || 0)
        }
      })
    }

    // Calculate member balances
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
    console.error("Error in getSummary:", error)
    // Return default values instead of throwing
    return {
      totalExpenses: 0,
      totalPayments: 0,
      memberCount: 0,
      remainingAmount: 0,
      memberBalances: {},
    }
  }
}

// Group actions
export async function getGroups() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("groups")
    .select(`
      *,
      creator:users!created_by(
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching groups:", error)
    return []
  }

  return data || []
}

export async function getGroupById(id: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("groups")
    .select(`
      *,
      creator:users!created_by(
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching group:", error)
    throw new Error("Failed to fetch group")
  }

  return data
}

export async function createGroup(group: {
  name: string
  description?: string
  created_by: string
}) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("groups").insert(group).select().single()

  if (error) {
    console.error("Error creating group:", error)
    throw new Error("Failed to create group")
  }

  // Add creator as owner
  await supabase.from("group_members").insert({
    user_id: group.created_by,
    group_id: data.id,
    role: "owner",
  })

  revalidatePath("/groups")
  return data
}

export async function joinGroup(groupCode: string, userId: string) {
  const supabase = createServerSupabaseClient()

  // Find group by code
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id")
    .eq("group_code", groupCode)
    .single()

  if (groupError || !group) {
    throw new Error("Group not found")
  }

  // Add user to group
  const { error } = await supabase.from("group_members").insert({
    user_id: userId,
    group_id: group.id,
    role: "member",
  })

  if (error) {
    console.error("Error joining group:", error)
    throw new Error("Failed to join group")
  }

  revalidatePath("/groups")
  return group
}
