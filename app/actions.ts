"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// Expense actions
export async function getExpenses(limit?: number) {
  const supabase = createServerSupabaseClient()
  let query = supabase
    .from("expenses")
    .select(`
    *,
    members!created_by (
      id,
      name,
      avatar_url
    )
  `)
    .order("date", { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching expenses:", error)
    throw new Error("Failed to fetch expenses")
  }

  return data
}

export async function getExpenseById(id: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("expenses")
    .select(`
      *,
      members!created_by (
        id,
        name,
        avatar_url
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
export async function getPayments(limit?: number) {
  const supabase = createServerSupabaseClient()
  let query = supabase
    .from("payments")
    .select(`
      *,
      members!payments_member_id_fkey (
        id,
        name,
        avatar_url
      ),
      approver:members!payments_approved_by_fkey (
        id,
        name,
        avatar_url
      )
    `)
    .order("payment_date", { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching payments:", error)
    throw new Error("Failed to fetch payments")
  }

  return data
}

export async function getPaymentById(id: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      members!payments_member_id_fkey (
        id,
        name,
        avatar_url
      ),
      approver:members!payments_approved_by_fkey (
        id,
        name,
        avatar_url
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
  member_id: string
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
    member_id?: string
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
export async function getFoodItems(category?: string) {
  const supabase = createServerSupabaseClient()
  let query = supabase.from("food_items").select("*")

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching food items:", error)
    throw new Error("Failed to fetch food items")
  }

  return data
}

export async function getFoodItemById(id: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("food_items").select("*").eq("id", id).single()

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
export async function getSummary() {
  const supabase = createServerSupabaseClient()

  try {
    // Get total expenses
    const { data: expenses, error: expensesError } = await supabase.from("expenses").select("total_price, participants")

    if (expensesError) {
      console.error("Error fetching expense totals:", expensesError)
      throw new Error("Failed to calculate summary")
    }

    // Get total payments
    const { data: payments, error: paymentsError } = await supabase.from("payments").select("amount")

    if (paymentsError) {
      console.error("Error fetching payment totals:", paymentsError)
      throw new Error("Failed to calculate summary")
    }

    // Get all members
    const { data: members, error: membersError } = await supabase.from("members").select("id")

    if (membersError) {
      console.error("Error counting members:", membersError)
      throw new Error("Failed to calculate summary")
    }

    // Get payments by member
    const { data: paymentsByMember, error: paymentsByMemberError } = await supabase
      .from("payments")
      .select("member_id, amount")

    if (paymentsByMemberError) {
      console.error("Error fetching payments by member:", paymentsByMemberError)
      throw new Error("Failed to calculate summary")
    }

    const totalExpenses = expenses?.reduce((sum, expense) => sum + Number(expense.total_price || 0), 0) || 0
    const totalPayments = payments?.reduce((sum, payment) => sum + Number(payment.amount || 0), 0) || 0
    const memberCount = members?.length || 0

    // Initialize member expenses and payments
    const memberExpenses = {}
    const memberPayments = {}

    if (members) {
      members.forEach((member) => {
        memberExpenses[member.id] = 0
        memberPayments[member.id] = 0
      })
    }

    // Calculate expenses per member based on participants
    if (expenses && members) {
      expenses.forEach((expense) => {
        // If no participants specified, assume all members participate
        const participants =
          expense.participants && expense.participants.length > 0 ? expense.participants : members.map((m) => m.id)

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
    if (paymentsByMember) {
      paymentsByMember.forEach((payment) => {
        if (memberPayments[payment.member_id] !== undefined) {
          memberPayments[payment.member_id] += Number(payment.amount || 0)
        }
      })
    }

    // Calculate member balances
    const memberBalances = {}
    if (members) {
      members.forEach((member) => {
        const owed = memberExpenses[member.id] || 0
        const paid = memberPayments[member.id] || 0
        memberBalances[member.id] = {
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
