"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Receipt, Users, CreditCard, Coffee } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Coffee className="h-6 w-6 text-teal-600" />
            <span className="hidden font-bold sm:inline-block">Quản Lý Chi Tiêu</span>
          </Link>
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <Link
              href="/"
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                pathname === "/" ? "text-primary" : "text-muted-foreground",
              )}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Tổng quan
            </Link>
            <Link
              href="/expenses"
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                pathname === "/expenses" ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Receipt className="mr-2 h-4 w-4" />
              Chi tiêu
            </Link>
            <Link
              href="/payments"
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                pathname === "/payments" ? "text-primary" : "text-muted-foreground",
              )}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Thanh toán
            </Link>
            <Link
              href="/members"
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                pathname === "/members" ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Users className="mr-2 h-4 w-4" />
              Thành viên
            </Link>
            <Link
              href="/food-items"
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                pathname === "/food-items" ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Coffee className="mr-2 h-4 w-4" />
              Món ăn
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4 md:hidden">
          <Link href="/">
            <Coffee className="h-6 w-6 text-teal-600" />
          </Link>
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <LayoutDashboard className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="/expenses">
              <Receipt className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="/payments">
              <CreditCard className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="/members">
              <Users className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="/food-items">
              <Coffee className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
