import { Suspense } from "react"
import { MainNav } from "@/components/main-nav"
import { PaymentsHeader } from "@/components/payments/payments-header"
import { PaymentsTable } from "@/components/payments/payments-table"
import { Skeleton } from "@/components/ui/skeleton"

export default function PaymentsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PaymentsHeader />
        <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
          <PaymentsTable />
        </Suspense>
      </div>
    </div>
  )
}
