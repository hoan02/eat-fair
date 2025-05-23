import { Suspense } from "react"
import { MainNav } from "@/components/main-nav"
import { FoodItemsHeader } from "@/components/food-items/food-items-header"
import { FoodItemsGrid } from "@/components/food-items/food-items-grid"
import { Skeleton } from "@/components/ui/skeleton"

export default function FoodItemsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <FoodItemsHeader />
        <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
          <FoodItemsGrid />
        </Suspense>
      </div>
    </div>
  )
}
