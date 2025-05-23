"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Download, FileSpreadsheet, FileText } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const reportFormSchema = z.object({
  groupId: z.string().min(1, { message: "Vui lòng chọn nhóm" }),
  period: z.enum(["week", "month", "year", "custom"], {
    required_error: "Vui lòng chọn khoảng thời gian",
  }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  format: z.enum(["pdf", "excel", "csv"], {
    required_error: "Vui lòng chọn định dạng xuất",
  }),
  reportType: z.enum(["expenses", "payments", "summary"], {
    required_error: "Vui lòng chọn loại báo cáo",
  }),
})

type ReportFormValues = z.infer<typeof reportFormSchema>

interface Group {
  id: string
  name: string
}

interface ReportGeneratorProps {
  groups: Group[]
}

export function ReportGenerator({ groups }: ReportGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      period: "month",
      format: "pdf",
      reportType: "summary",
    },
  })

  const watchPeriod = form.watch("period")

  async function onSubmit(data: ReportFormValues) {
    setIsLoading(true)

    try {
      // Giả lập tạo báo cáo
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Generating report with data:", data)

      toast({
        title: "Báo cáo đã được tạo",
        description: `Báo cáo ${data.reportType} đã được tạo thành công với định dạng ${data.format.toUpperCase()}`,
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo báo cáo. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tạo báo cáo</CardTitle>
        <CardDescription>Tạo báo cáo chi tiêu, thanh toán hoặc tổng hợp theo khoảng thời gian</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhóm</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nhóm" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reportType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại báo cáo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại báo cáo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="expenses">Chi tiêu</SelectItem>
                      <SelectItem value="payments">Thanh toán</SelectItem>
                      <SelectItem value="summary">Tổng hợp</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Khoảng thời gian</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn khoảng thời gian" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="week">Tuần này</SelectItem>
                      <SelectItem value="month">Tháng này</SelectItem>
                      <SelectItem value="year">Năm nay</SelectItem>
                      <SelectItem value="custom">Tùy chỉnh</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchPeriod === "custom" && (
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-1 flex-col">
                      <FormLabel>Từ ngày</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-1 flex-col">
                      <FormLabel>Đến ngày</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Định dạng xuất</FormLabel>
                  <div className="flex flex-wrap gap-3">
                    <FormControl>
                      <Tabs defaultValue={field.value} onValueChange={field.onChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="pdf" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>PDF</span>
                          </TabsTrigger>
                          <TabsTrigger value="excel" className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            <span>Excel</span>
                          </TabsTrigger>
                          <TabsTrigger value="csv" className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            <span>CSV</span>
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </FormControl>
                  </div>
                  <FormDescription>Chọn định dạng file báo cáo bạn muốn tải xuống</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang tạo báo cáo..." : "Tạo báo cáo"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
