"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { joinGroup } from "@/app/groups/actions"

const joinGroupSchema = z.object({
  groupCode: z.string().min(1, { message: "Mã nhóm không được để trống" }),
})

type JoinGroupValues = z.infer<typeof joinGroupSchema>

export function JoinGroupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<JoinGroupValues>({
    resolver: zodResolver(joinGroupSchema),
    defaultValues: {
      groupCode: "",
    },
  })

  const onSubmit = async (data: JoinGroupValues) => {
    setIsLoading(true)

    try {
      const result = await joinGroup(data.groupCode)

      if (result.success) {
        toast({
          title: "Tham gia nhóm thành công",
          description: "Bạn đã tham gia vào nhóm thành công!",
        })
        router.push(`/dashboard?groupId=${result.groupId}`)
      } else {
        toast({
          title: "Tham gia nhóm thất bại",
          description: result.error || "Mã nhóm không hợp lệ",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Tham gia nhóm thất bại",
        description: "Đã xảy ra lỗi khi tham gia nhóm. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Tham gia nhóm</CardTitle>
          <CardDescription>Nhập mã nhóm để tham gia vào một nhóm hiện có</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupCode">Mã nhóm</Label>
            <Input
              id="groupCode"
              placeholder="Nhập mã nhóm (ví dụ: ABC123)"
              {...form.register("groupCode")}
              disabled={isLoading}
            />
            {form.formState.errors.groupCode && (
              <p className="text-sm text-red-500">{form.formState.errors.groupCode.message}</p>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Mã nhóm là một chuỗi ký tự duy nhất được cung cấp bởi trưởng nhóm.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Tham gia
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
