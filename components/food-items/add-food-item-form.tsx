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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addFoodItem } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"

export function AddFoodItemForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [newFoodItem, setNewFoodItem] = useState({
    name: "",
    default_price: 0,
    description: "",
    image_url: "",
    category: "Món chính",
  })

  const categories = ["Món chính", "Khai vị", "Ăn nhẹ", "Đồ uống", "Tráng miệng", "Khác"]

  const handleFoodItemChange = (field, value) => {
    setNewFoodItem((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewFoodItem((prev) => ({ ...prev, image_url: event.target.result }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!newFoodItem.name || !newFoodItem.default_price) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên món ăn và giá tiền",
        variant: "destructive",
      })
      return
    }

    try {
      await addFoodItem(newFoodItem)
      toast({
        title: "Thêm thành công",
        description: `Đã thêm món ăn "${newFoodItem.name}"`,
      })
      setOpen(false)
      resetForm()
      router.refresh()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi thêm món ăn",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setNewFoodItem({
      name: "",
      default_price: 0,
      description: "",
      image_url: "",
      category: "Món chính",
    })
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
          <Plus className="mr-2 h-4 w-4" /> Thêm món ăn
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm món ăn mới</DialogTitle>
          <DialogDescription>Nhập thông tin chi tiết về món ăn</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="food-name" className="text-right">
              Tên món
            </Label>
            <Input
              id="food-name"
              value={newFoodItem.name}
              onChange={(e) => handleFoodItemChange("name", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="food-price" className="text-right">
              Giá tiền (VND)
            </Label>
            <Input
              id="food-price"
              type="number"
              min="0"
              step="1000"
              value={newFoodItem.default_price}
              onChange={(e) => handleFoodItemChange("default_price", Number.parseInt(e.target.value) || 0)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="food-category" className="text-right">
              Danh mục
            </Label>
            <div className="col-span-3">
              <Select value={newFoodItem.category} onValueChange={(value) => handleFoodItemChange("category", value)}>
                <SelectTrigger id="food-category">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="food-description" className="text-right">
              Mô tả
            </Label>
            <Textarea
              id="food-description"
              value={newFoodItem.description}
              onChange={(e) => handleFoodItemChange("description", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="food-image" className="text-right">
              Hình ảnh
            </Label>
            <div className="col-span-3">
              <Input id="food-image" type="file" accept="image/*" onChange={handleImageUpload} className="col-span-3" />
              {newFoodItem.image_url && (
                <div className="mt-2 relative w-full h-32 bg-slate-100 rounded-md overflow-hidden">
                  <img
                    src={newFoodItem.image_url || "/placeholder.svg"}
                    alt="Food preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          {newFoodItem.default_price > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Giá hiển thị</Label>
              <div className="col-span-3 font-medium text-lg">{formatCurrency(newFoodItem.default_price)}</div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            Thêm mới
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
