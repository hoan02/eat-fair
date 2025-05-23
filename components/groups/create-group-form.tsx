"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { createGroup } from "@/app/groups/actions"

const groupFormSchema = z.object({
  name: z.string().min(2, { message: "Tên nhóm phải có ít nhất 2 ký tự" }),
  description: z.string().optional(),
})

type GroupFormValues = z.infer<typeof groupFormSchema>

export function CreateGroupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: GroupFormValues) => {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", data.name)
      if (data.description) formData.append("description", data.description)
      if (avatarFile) formData.append("avatar", avatarFile)

      const result = await createGroup(formData)

      if (result.success) {
        toast({
          title: "Tạo nhóm thành công",
          description: "Nhóm mới đã được tạo thành công!",
        })
        router.push(`/dashboard?groupId=${result.groupId}`)
      } else {
        toast({
          title: "Tạo nhóm thất bại",
          description: result.error || "Đã xảy ra lỗi khi tạo nhóm",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Tạo nhóm thất bại",
        description: "Đã xảy ra lỗi khi tạo nhóm. Vui lòng thử lại sau.",
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
          <CardTitle>Thông tin nhóm</CardTitle>
          <CardDescription>Nhập thông tin chi tiết về nhóm mới của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên nhóm</Label>
            <Input id="name" placeholder="Nhập tên nhóm" {...form.register("name")} disabled={isLoading} />
            {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả ngắn về nhóm (tùy chọn)"
              {...form.register("description")}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar">Ảnh đại diện nhóm</Label>
            <div className="flex items-center gap-4">
              <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} disabled={isLoading} />
              {avatarPreview && (
                <div className="h-16 w-16 rounded-full overflow-hidden border">
                  <img
                    src={avatarPreview || "/placeholder.svg"}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Tạo nhóm
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
