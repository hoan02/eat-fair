"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpenseSummary } from "@/components/dashboard/expense-summary"
import { MemberSummary } from "@/components/dashboard/member-summary"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"

interface DashboardTabsProps {
  groupId: string
}

export function DashboardTabs({ groupId }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid grid-cols-4 md:w-[400px]">
        <TabsTrigger value="overview">Tổng quan</TabsTrigger>
        <TabsTrigger value="expenses">Chi tiêu</TabsTrigger>
        <TabsTrigger value="members">Thành viên</TabsTrigger>
        <TabsTrigger value="charts">Biểu đồ</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ExpenseSummary groupId={groupId} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivity groupId={groupId} />
          </div>
          <div>
            <MemberSummary groupId={groupId} />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="expenses" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ExpenseChart groupId={groupId} type="category" />
          </div>
          <div>
            <ExpenseChart groupId={groupId} type="time" />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="members" className="space-y-4">
        <MemberSummary groupId={groupId} detailed />
      </TabsContent>
      <TabsContent value="charts" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <ExpenseChart groupId={groupId} type="category" />
          <ExpenseChart groupId={groupId} type="time" />
        </div>
      </TabsContent>
    </Tabs>
  )
}
