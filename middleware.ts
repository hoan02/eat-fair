import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Các đường dẫn công khai không cần xác thực
  const isPublicPath = path === "/auth/login" || path === "/auth/register"

  // Lấy cookie user_id để kiểm tra đăng nhập
  const userId = request.cookies.get("user_id")?.value

  // Nếu đã đăng nhập mà truy cập trang công khai, chuyển hướng về dashboard
  if (isPublicPath && userId) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Nếu chưa đăng nhập mà truy cập trang yêu cầu xác thực, chuyển hướng về trang đăng nhập
  if (!isPublicPath && !userId && !path.startsWith("/api")) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

// Chỉ áp dụng middleware cho các đường dẫn sau
export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/expenses/:path*",
    "/payments/:path*",
    "/members/:path*",
    "/food-items/:path*",
    "/groups/:path*",
    "/auth/:path*",
  ],
}
