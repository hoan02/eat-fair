import { Suspense } from "react"
import { MainNav } from "@/components/main-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { RecentExpenses } from "@/components/recent-expenses"
import { RecentPayments } from "@/components/recent-payments"
import { MembersSummary } from "@/components/members-summary"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <DashboardHeader />
        {/* Đã xóa phần Overview trùng lặp */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <div className="grid gap-4">
              <Suspense fallback={<Skeleton className="h-[450px] w-full" />}>
                <RecentExpenses />
              </Suspense>
              <Suspense fallback={<Skeleton className="h-[450px] w-full" />}>
                <RecentPayments />
              </Suspense>
            </div>
          </div>
          <div className="col-span-3">
            <Suspense fallback={<Skeleton className="h-[450px] w-full" />}>
              <MembersSummary />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
