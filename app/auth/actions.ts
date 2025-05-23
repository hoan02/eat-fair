"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export async function loginUser({ email, password }: { email: string; password: string }) {
  try {
    const supabase = createServerSupabaseClient()

    // Tìm user theo email
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("email", email).single()

    if (userError || !user) {
      return { success: false, error: "Email hoặc mật khẩu không đúng" }
    }

    // Kiểm tra mật khẩu
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return { success: false, error: "Email hoặc mật khẩu không đúng" }
    }

    // Tạo session
    const { data: session, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (sessionError) {
      return { success: false, error: sessionError.message }
    }

    // Lưu thông tin user vào cookie
    cookies().set("user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true, user }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Đã xảy ra lỗi khi đăng nhập" }
  }
}

export async function registerUser({
  fullName,
  email,
  password,
}: {
  fullName: string
  email: string
  password: string
}) {
  try {
    const supabase = createServerSupabaseClient()

    // Kiểm tra email đã tồn tại chưa
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

    if (existingUser) {
      return { success: false, error: "Email đã được sử dụng" }
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10)

    // Tạo user mới
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        email,
        password_hash: hashedPassword,
        full_name: fullName,
      })
      .select()

    if (createError) {
      return { success: false, error: createError.message }
    }

    // Tạo tài khoản auth
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Register error:", error)
    return { success: false, error: "Đã xảy ra lỗi khi đăng ký" }
  }
}

export async function logoutUser() {
  const supabase = createServerSupabaseClient()
  await supabase.auth.signOut()
  cookies().delete("user_id")
  redirect("/auth/login")
}

export async function getCurrentUser() {
  const userId = cookies().get("user_id")?.value

  if (!userId) {
    return null
  }

  const supabase = createServerSupabaseClient()
  const { data: user, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error || !user) {
    return null
  }

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return user
}
