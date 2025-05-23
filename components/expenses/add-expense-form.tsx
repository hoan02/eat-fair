"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
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
import { DatePicker } from "@/components/date-picker"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { addExpense, getFoodItems, getMembers } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"

export function AddExpenseForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [foodItems, setFoodItems] = useState([])
  const [members, setMembers] = useState([])
  const [selectedFoodItem, setSelectedFoodItem] = useState(null)
  const [selectedMembers, setSelectedMembers] = useState([])
  const [newExpense, setNewExpense] = useState({
    date: new Date(),
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
    const loadData = async () => {
      try {
        const [foodItemsData, membersData] = await Promise.all([getFoodItems(), getMembers()])
        setFoodItems(foodItemsData)
        setMembers(membersData)

        // Mặc định chọn tất cả thành viên
        setSelectedMembers(membersData.map((m) => m.id))
        setNewExpense((prev) => ({
          ...prev,
          participants: membersData.map((m) => m.id),
          created_by: membersData.find((m) => m.is_group_leader)?.id || membersData[0]?.id,
        }))
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu. Vui lòng thử lại sau.",
          variant: "destructive",
        })
      }
    }

    loadData()
  }, [])

  const handleExpenseChange = (field, value) => {
    setNewExpense((prev) => {
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

  const handleFoodItemSelect = (foodItem) => {
    setSelectedFoodItem(foodItem)
    setNewExpense((prev) => ({
      ...prev,
      food_item: foodItem.name,
      unit_price: foodItem.default_price,
      total_price: prev.quantity * foodItem.default_price,
    }))
  }

  const handleMemberToggle = (memberId) => {
    setSelectedMembers((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId)
      } else {
        return [...prev, memberId]
      }
    })

    setNewExpense((prev) => ({
      ...prev,
      participants: selectedMembers.includes(memberId)
        ? prev.participants.filter((id) => id !== memberId)
        : [...prev.participants, memberId],
    }))
  }

  const handleSelectAllMembers = () => {
    const allMemberIds = members.map((m) => m.id)
    setSelectedMembers(allMemberIds)
    setNewExpense((prev) => ({
      ...prev,
      participants: allMemberIds,
    }))
  }

  const handleDeselectAllMembers = () => {
    setSelectedMembers([])
    setNewExpense((prev) => ({
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
          setNewExpense((prev) => ({ ...prev, receipt_image_url: event.target.result }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!newExpense.food_item || !newExpense.quantity || !newExpense.unit_price || !newExpense.created_by) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin cần thiết",
        variant: "destructive",
      })
      return
    }

    if (newExpense.participants.length === 0) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn ít nhất một thành viên tham gia",
        variant: "destructive",
      })
      return
    }

    try {
      await addExpense({
        ...newExpense,
        date: format(newExpense.date, "yyyy-MM-dd"),
      })

      toast({
        title: "Thêm thành công",
        description: `Đã thêm khoản chi "${newExpense.food_item}"`,
      })

      setOpen(false)
      resetForm()
      router.refresh()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi lưu khoản chi",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setNewExpense({
      date: new Date(),
      food_item: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      notes: "",
      receipt_image_url: "",
      created_by: members.find((m) => m.is_group_leader)?.id || members[0]?.id,
      participants: members.map((m) => m.id),
    })
    setSelectedFoodItem(null)
    setSelectedMembers(members.map((m) => m.id))
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
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
          <Plus className="mr-2 h-4 w-4" /> Thêm khoản chi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Thêm khoản chi mới</DialogTitle>
          <DialogDescription>Nhập thông tin chi tiết về khoản chi tiêu</DialogDescription>
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
                  <DatePicker date={newExpense.date} setDate={(date) => handleExpenseChange("date", date)} />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expense-food" className="text-right">
                  Món ăn
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {selectedFoodItem ? selectedFoodItem.name : "Chọn món ăn"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Tìm món ăn..." />
                        <CommandList>
                          <CommandEmpty>Không tìm thấy món ăn</CommandEmpty>
                          <CommandGroup>
                            <ScrollArea className="h-[200px]">
                              {foodItems.map((item) => (
                                <CommandItem
                                  key={item.id}
                                  value={item.name}
                                  onSelect={() => handleFoodItemSelect(item)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedFoodItem?.id === item.id ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  <span>{item.name}</span>
                                  <span className="ml-auto text-xs text-muted-foreground">
                                    {formatCurrency(item.default_price)}
                                  </span>
                                </CommandItem>
                              ))}
                            </ScrollArea>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Input
                    id="expense-food"
                    value={newExpense.food_item}
                    onChange={(e) => handleExpenseChange("food_item", e.target.value)}
                    className="mt-2"
                    placeholder="Hoặc nhập tên món ăn"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expense-quantity" className="text-right">
                  Số lượng
                </Label>
                <Input
                  id="expense-quantity"
                  type="number"
                  min="1"
                  value={newExpense.quantity}
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
                  value={newExpense.unit_price}
                  onChange={(e) => handleExpenseChange("unit_price", Number.parseInt(e.target.value) || 0)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expense-total" className="text-right">
                  Thành tiền
                </Label>
                <div className="col-span-3 font-medium">{formatCurrency(newExpense.total_price)}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expense-creator" className="text-right">
                  Người tạo
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {members.find((m) => m.id === newExpense.created_by)?.name || "Chọn người tạo"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Tìm thành viên..." />
                        <CommandList>
                          <CommandEmpty>Không tìm thấy thành viên</CommandEmpty>
                          <CommandGroup>
                            <ScrollArea className="h-[200px]">
                              {members.map((member) => (
                                <CommandItem
                                  key={member.id}
                                  value={member.name}
                                  onSelect={() => handleExpenseChange("created_by", member.id)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      newExpense.created_by === member.id ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  <span>{member.name}</span>
                                  {member.is_group_leader && (
                                    <span className="ml-auto text-xs text-muted-foreground">Trưởng nhóm</span>
                                  )}
                                </CommandItem>
                              ))}
                            </ScrollArea>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                Mỗi người sẽ trả: {formatCurrency(newExpense.total_price / (selectedMembers.length || 1))}
              </div>
            </TabsContent>
            <TabsContent value="additional" className="space-y-4 pt-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expense-notes" className="text-right">
                  Ghi chú
                </Label>
                <Textarea
                  id="expense-notes"
                  value={newExpense.notes}
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
                  {newExpense.receipt_image_url && (
                    <div className="mt-2 relative w-full h-32 bg-slate-100 rounded-md overflow-hidden">
                      <img
                        src={newExpense.receipt_image_url || "/placeholder.svg"}
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
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
          >
            Thêm mới
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
