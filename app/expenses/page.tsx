import { Suspense } from "react"
import { MainNav } from "@/components/main-nav"
import { ExpensesHeader } from "@/components/expenses/expenses-header"
import { ExpensesTable } from "@/components/expenses/expenses-table"
import { ExpensesFilter } from "@/components/expenses/expenses-filter"
import { Skeleton } from "@/components/ui/skeleton"
import { getExpenses } from "@/app/actions"

export default async function ExpensesPage() {
  const expenses = await getExpenses()

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ExpensesHeader />
        <Suspense fallback={<Skeleton className="h-[100px] w-full" />}>
          <ExpensesFilter />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
          <ExpensesTable initialExpenses={expenses} />
        </Suspense>
      </div>
    </div>
  )
}
