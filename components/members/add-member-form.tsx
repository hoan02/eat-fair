"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { addMember } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"

export function AddMemberForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [newMember, setNewMember] = useState({
    name: "",
    avatar_url: "/placeholder.svg?height=40&width=40",
    is_group_leader: false,
    phone: "",
    address: "",
    email: "",
  })

  const handleMemberChange = (field, value) => {
    setNewMember((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewMember((prev) => ({ ...prev, avatar_url: event.target.result }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!newMember.name) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên thành viên",
        variant: "destructive",
      })
      return
    }

    try {
      await addMember(newMember)
      toast({
        title: "Thêm thành công",
        description: `Đã thêm thành viên "${newMember.name}"`,
      })
      setOpen(false)
      resetForm()
      router.refresh()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi thêm thành viên",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setNewMember({
      name: "",
      avatar_url: "/placeholder.svg?height=40&width=40",
      is_group_leader: false,
      phone: "",
      address: "",
      email: "",
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Thêm thành viên
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm thành viên mới</DialogTitle>
          <DialogDescription>Nhập thông tin chi tiết về thành viên</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="member-name" className="text-right">
              Tên
            </Label>
            <Input
              id="member-name"
              value={newMember.name}
              onChange={(e) => handleMemberChange("name", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="member-email" className="text-right">
              Email
            </Label>
            <Input
              id="member-email"
              type="email"
              value={newMember.email}
              onChange={(e) => handleMemberChange("email", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="member-phone" className="text-right">
              Số điện thoại
            </Label>
            <Input
              id="member-phone"
              value={newMember.phone}
              onChange={(e) => handleMemberChange("phone", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="member-address" className="text-right">
              Địa chỉ
            </Label>
            <Textarea
              id="member-address"
              value={newMember.address}
              onChange={(e) => handleMemberChange("address", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="member-avatar" className="text-right">
              Avatar
            </Label>
            <div className="col-span-3">
              <Input
                id="member-avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="col-span-3"
              />
              {newMember.avatar_url && (
                <div className="mt-2 relative w-16 h-16 bg-slate-100 rounded-full overflow-hidden">
                  <img
                    src={newMember.avatar_url || "/placeholder.svg"}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="member-leader" className="text-right">
              Trưởng nhóm
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch
                id="member-leader"
                checked={newMember.is_group_leader}
                onCheckedChange={(checked) => handleMemberChange("is_group_leader", checked)}
              />
              <Label htmlFor="member-leader">{newMember.is_group_leader ? "Có" : "Không"}</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            Thêm mới
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
