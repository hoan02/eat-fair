"use client"

import { useState } from "react"
import { Plus, Check, X, Loader2, Edit, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { addMember, deleteMember, updateMember } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"

export function MembersList({ members, payments, summary, loading }) {
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [newMember, setNewMember] = useState({
    name: "",
    avatar_url: "/placeholder.svg?height=40&width=40",
  })

  const [isEditingMember, setIsEditingMember] = useState(false)
  const [currentMember, setCurrentMember] = useState(null)
  const [editMember, setEditMember] = useState({
    name: "",
    avatar_url: "",
  })

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  // Calculate member payment status
  const getMemberPaymentStatus = (memberId) => {
    const memberPayments = payments.filter((payment) => payment.member_id === memberId)
    const totalPaid = memberPayments.reduce((sum, payment) => sum + Number(payment.amount), 0)
    const amountPerPerson = summary.amountPerPerson

    return {
      totalPaid,
      amountPerPerson,
      remaining: Math.max(0, amountPerPerson - totalPaid),
      hasPaid: totalPaid >= amountPerPerson,
    }
  }

  // Add member
  const handleAddMember = async () => {
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
      setNewMember({
        name: "",
        avatar_url: "/placeholder.svg?height=40&width=40",
      })
      setIsAddingMember(false)
      // Reload the page to refresh data
      window.location.reload()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi thêm thành viên",
        variant: "destructive",
      })
    }
  }

  // Edit member
  const handleEditMember = (member) => {
    setCurrentMember(member)
    setEditMember({
      name: member.name,
      avatar_url: member.avatar_url || "/placeholder.svg?height=40&width=40",
    })
    setIsEditingMember(true)
  }

  // Update member
  const handleUpdateMember = async () => {
    if (!editMember.name) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên thành viên",
        variant: "destructive",
      })
      return
    }

    try {
      await updateMember(currentMember.id, editMember)
      toast({
        title: "Cập nhật thành công",
        description: `Đã cập nhật thông tin "${editMember.name}"`,
      })
      setIsEditingMember(false)
      setCurrentMember(null)
      // Reload the page to refresh data
      window.location.reload()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi cập nhật thành viên",
        variant: "destructive",
      })
    }
  }

  // Delete member
  const handleDeleteMember = async (id) => {
    try {
      await deleteMember(id)
      toast({
        title: "Xóa thành công",
        description: "Đã xóa thành viên",
      })
      // Reload the page to refresh data
      window.location.reload()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi xóa thành viên",
        variant: "destructive",
      })
    }
  }

  // Handle avatar upload for new member
  const handleNewMemberAvatarUpload = (e) => {
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

  // Handle avatar upload for edit member
  const handleEditMemberAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditMember((prev) => ({ ...prev, avatar_url: event.target.result }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex flex-row items-center justify-between">
        <div>
          <CardTitle>Thành Viên</CardTitle>
          <CardDescription className="text-blue-100">Danh sách người tham gia chia tiền</CardDescription>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setIsAddingMember(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Đang tải dữ liệu...</span>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Chưa có thành viên nào</div>
          ) : (
            members.map((member) => {
              const paymentStatus = getMemberPaymentStatus(member.id)

              return (
                <div key={member.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1"
                      onClick={() => handleEditMember(member)}
                    >
                      <Avatar className="border-2 border-white shadow-sm">
                        <AvatarImage src={member.avatar_url || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {paymentStatus.hasPaid ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Check className="h-3 w-3 mr-1" /> Đã thanh toán đủ
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                              <X className="h-3 w-3 mr-1" /> Còn thiếu {formatCurrency(paymentStatus.remaining)}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Đã trả: {formatCurrency(paymentStatus.totalPaid)} /{" "}
                          {formatCurrency(paymentStatus.amountPerPerson)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEditMember(member)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteMember(member.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>

      {/* Add Member Dialog */}
      <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm thành viên mới</DialogTitle>
            <DialogDescription>Nhập thông tin thành viên tham gia chia tiền</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="member-name" className="text-right">
                Tên
              </Label>
              <Input
                id="member-name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="member-avatar" className="text-right">
                Avatar
              </Label>
              <div className="col-span-3">
                <div className="flex items-center gap-4">
                  <Input
                    id="member-avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleNewMemberAvatarUpload}
                    className="flex-1"
                  />
                  {newMember.avatar_url && (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={newMember.avatar_url || "/placeholder.svg"} alt="Preview" />
                      <AvatarFallback>
                        <ImageIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingMember(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleAddMember}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditingMember} onOpenChange={setIsEditingMember}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thành viên</DialogTitle>
            <DialogDescription>Cập nhật thông tin thành viên</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-member-name" className="text-right">
                Tên
              </Label>
              <Input
                id="edit-member-name"
                value={editMember.name}
                onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-member-avatar" className="text-right">
                Avatar
              </Label>
              <div className="col-span-3">
                <div className="flex items-center gap-4">
                  <Input
                    id="edit-member-avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleEditMemberAvatarUpload}
                    className="flex-1"
                  />
                  {editMember.avatar_url && (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={editMember.avatar_url || "/placeholder.svg"} alt="Preview" />
                      <AvatarFallback>
                        <ImageIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingMember(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleUpdateMember}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
