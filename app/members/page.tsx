import { Suspense } from "react"
import { MainNav } from "@/components/main-nav"
import { MembersHeader } from "@/components/members/members-header"
import { MembersGrid } from "@/components/members/members-grid"
import { Skeleton } from "@/components/ui/skeleton"

export default function MembersPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <MembersHeader />
        <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
          <MembersGrid />
        </Suspense>
      </div>
    </div>
  )
}
