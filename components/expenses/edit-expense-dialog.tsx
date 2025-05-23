"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/date-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateExpense, getMembers } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

export function EditExpenseDialog({ expense, open, onOpenChange, onSuccess }) {
  const [members, setMembers] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])
  const [editedExpense, setEditedExpense] = useState({
    date: "",
    food_item: "",
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    notes: "",
    receipt_image_url: "",
    created_by: "",
    participants: [],
  })

  useEffect(() => {
    if (expense && open) {
      setEditedExpense({
        date: expense.date,
        food_item: expense.food_item,
        quantity: expense.quantity,
        unit_price: expense.unit_price,
        total_price: expense.total_price,
        notes: expense.notes || "",
        receipt_image_url: expense.receipt_image_url || "",
        created_by: expense.created_by || "",
        participants: expense.participants || [],
      })
      setSelectedMembers(expense.participants || [])
    }

    const loadMembers = async () => {
      try {
        const membersData = await getMembers()
        setMembers(membersData)
      } catch (error) {
        console.error("Error loading members:", error)
      }
    }

    if (open) {
      loadMembers()
    }
  }, [expense, open])

  const handleExpenseChange = (field, value) => {
    setEditedExpense((prev) => {
      const updated = { ...prev, [field]: value }

      // Auto-calculate total price when quantity or unit price changes
      if (field === "quantity" || field === "unit_price") {
        const quantity = field === "quantity" ? value : prev.quantity || 0
        const unitPrice = field === "unit_price" ? value : prev.unit_price || 0
        updated.total_price = quantity * unitPrice
      }

      return updated
    })
  }

  const handleMemberToggle = (memberId) => {
    setSelectedMembers((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId)
      } else {
        return [...prev, memberId]
      }
    })

    setEditedExpense((prev) => ({
      ...prev,
      participants: selectedMembers.includes(memberId)
        ? prev.participants.filter((id) => id !== memberId)
        : [...prev.participants, memberId],
    }))
  }

  const handleSelectAllMembers = () => {
    const allMemberIds = members.map((m) => m.id)
    setSelectedMembers(allMemberIds)
    setEditedExpense((prev) => ({
      ...prev,
      participants: allMemberIds,
    }))
  }

  const handleDeselectAllMembers = () => {
    setSelectedMembers([])
    setEditedExpense((prev) => ({
      ...prev,
      participants: [],
    }))
  }

  const handleReceiptUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditedExpense((prev) => ({ ...prev, receipt_image_url: event.target.result }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!editedExpense.food_item || !editedExpense.quantity || !editedExpense.unit_price) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin cần thiết",
        variant: "destructive",
      })
      return
    }

    try {
      await updateExpense(expense.id, {
        ...editedExpense,
        participants: selectedMembers,
      })

      toast({
        title: "Cập nhật thành công",
        description: `Đã cập nhật khoản chi "${editedExpense.food_item}"`,
      })

      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi cập nhật khoản chi",
        variant: "destructive",
      })
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa khoản chi</DialogTitle>
          <DialogDescription>Cập nhật thông tin chi tiết về khoản chi tiêu</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
              <TabsTrigger value="participants">Người tham gia</TabsTrigger>
              <TabsTrigger value="additional">Thông tin bổ sung</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expense-date" className="text-right">
                  Ngày
                </Label>
                <div className="col-span-3">
                  <DatePicker
                    date={editedExpense.date ? parseISO(editedExpense.date) : undefined}
                    setDate={(date) => handleExpenseChange("date", date ? format(date, "yyyy-MM-dd") : null)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expense-food" className="text-right">
                  Món ăn
                </Label>
                <Input
                  id="expense-food"
                  value={editedExpense.food_item}
                  onChange={(e) => handleExpenseChange("food_item", e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expense-quantity" className="text-right">
                  Số lượng
                </Label>
                <Input
                  id="expense-quantity"
                  type="number"
                  min="1"
                  value={editedExpense.quantity}
                  onChange={(e) => handleExpenseChange("quantity", Number.parseInt(e.target.value) || 0)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expense-price" className="text-right">
                  Đơn giá (VND)
                </Label>
                <Input
                  id="expense-price"
                  type="number"
                  min="0"
                  step="1000"
                  value={editedExpense.unit_price}
                  onChange={(e) => handleExpenseChange("unit_price", Number.parseInt(e.target.value) || 0)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expense-total" className="text-right">
                  Thành tiền
                </Label>
                <div className="col-span-3 font-medium">{formatCurrency(editedExpense.total_price)}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expense-creator" className="text-right">
                  Người tạo
                </Label>
                <div className="col-span-3">
                  <Select
                    value={editedExpense.created_by}
                    onValueChange={(value) => handleExpenseChange("created_by", value)}
                  >
                    <SelectTrigger id="expense-creator">
                      <SelectValue placeholder="Chọn người tạo" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                          {member.is_group_leader ? " (Trưởng nhóm)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="participants" className="space-y-4 pt-4">
              <div className="flex justify-between mb-4">
                <Button variant="outline" size="sm" onClick={handleSelectAllMembers}>
                  Chọn tất cả
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeselectAllMembers}>
                  Bỏ chọn tất cả
                </Button>
              </div>
              <ScrollArea className="h-[300px] border rounded-md p-4">
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`member-${member.id}`}
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={() => handleMemberToggle(member.id)}
                      />
                      <Label htmlFor={`member-${member.id}`} className="flex-1">
                        {member.name}
                        {member.is_group_leader && (
                          <span className="ml-2 text-xs text-muted-foreground">(Trưởng nhóm)</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="text-sm text-muted-foreground">
                Đã chọn {selectedMembers.length} / {members.length} thành viên
              </div>
              <div className="text-sm font-medium">
                Mỗi người sẽ trả: {formatCurrency(editedExpense.total_price / (selectedMembers.length || 1))}
              </div>
            </TabsContent>
            <TabsContent value="additional" className="space-y-4 pt-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expense-notes" className="text-right">
                  Ghi chú
                </Label>
                <Textarea
                  id="expense-notes"
                  value={editedExpense.notes}
                  onChange={(e) => handleExpenseChange("notes", e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expense-receipt" className="text-right">
                  Ảnh hóa đơn
                </Label>
                <div className="col-span-3">
                  <Input
                    id="expense-receipt"
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptUpload}
                    className="col-span-3"
                  />
                  {editedExpense.receipt_image_url && (
                    <div className="mt-2 relative w-full h-32 bg-slate-100 rounded-md overflow-hidden">
                      <img
                        src={editedExpense.receipt_image_url || "/placeholder.svg"}
                        alt="Receipt preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
          >
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
