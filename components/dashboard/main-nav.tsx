"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 flex">
      <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
        <Icons.logo className="h-6 w-6 text-primary" />
        <span className="hidden font-bold sm:inline-block">Quản Lý Chi Tiêu</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/dashboard"
          className={cn(
            "transition-colors hover:text-primary",
            pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
          )}
        >
          <div className="flex items-center gap-1">
            <Icons.dashboard className="h-4 w-4" />
            <span className="hidden md:block">Tổng quan</span>
          </div>
        </Link>
        <Link
          href="/expenses"
          className={cn(
            "transition-colors hover:text-primary",
            pathname === "/expenses" ? "text-primary" : "text-muted-foreground",
          )}
        >
          <div className="flex items-center gap-1">
            <Icons.receipt className="h-4 w-4" />
            <span className="hidden md:block">Chi tiêu</span>
          </div>
        </Link>
        <Link
          href="/payments"
          className={cn(
            "transition-colors hover:text-primary",
            pathname === "/payments" ? "text-primary" : "text-muted-foreground",
          )}
        >
          <div className="flex items-center gap-1">
            <Icons.creditCard className="h-4 w-4" />
            <span className="hidden md:block">Thanh toán</span>
          </div>
        </Link>
        <Link
          href="/groups"
          className={cn(
            "transition-colors hover:text-primary",
            pathname === "/groups" ? "text-primary" : "text-muted-foreground",
          )}
        >
          <div className="flex items-center gap-1">
            <Icons.users className="h-4 w-4" />
            <span className="hidden md:block">Nhóm</span>
          </div>
        </Link>
        <Link
          href="/reports"
          className={cn(
            "transition-colors hover:text-primary",
            pathname === "/reports" ? "text-primary" : "text-muted-foreground",
          )}
        >
          <div className="flex items-center gap-1">
            <Icons.pieChart className="h-4 w-4" />
            <span className="hidden md:block">Báo cáo</span>
          </div>
        </Link>
      </nav>
    </div>
  )
}
