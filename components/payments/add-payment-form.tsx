"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
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
import { DatePicker } from "@/components/date-picker"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addPayment, getMembers } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"

export function AddPaymentForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [members, setMembers] = useState([])
  const [newPayment, setNewPayment] = useState({
    member_id: "",
    amount: 0,
    payment_date: new Date(),
    payment_method: "Chuyển khoản",
    payment_proof_url: "",
    notes: "",
  })

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const membersData = await getMembers()
        setMembers(membersData)
      } catch (error) {
        console.error("Error loading members:", error)
      }
    }

    loadMembers()
  }, [])

  const handlePaymentChange = (field, value) => {
    setNewPayment((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleProofUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewPayment((prev) => ({ ...prev, payment_proof_url: event.target.result }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!newPayment.member_id || !newPayment.amount) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn thành viên và nhập số tiền",
        variant: "destructive",
      })
      return
    }

    try {
      await addPayment({
        ...newPayment,
        payment_date: format(newPayment.payment_date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      })

      toast({
        title: "Thêm thành công",
        description: "Đã thêm khoản thanh toán mới",
      })

      setOpen(false)
      resetForm()
      router.refresh()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi lưu khoản thanh toán",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setNewPayment({
      member_id: "",
      amount: 0,
      payment_date: new Date(),
      payment_method: "Chuyển khoản",
      payment_proof_url: "",
      notes: "",
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
          <Plus className="mr-2 h-4 w-4" /> Thêm thanh toán
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm khoản thanh toán mới</DialogTitle>
          <DialogDescription>Nhập thông tin chi tiết về khoản thanh toán</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-member" className="text-right">
              Thành viên
            </Label>
            <div className="col-span-3">
              <Select value={newPayment.member_id} onValueChange={(value) => handlePaymentChange("member_id", value)}>
                <SelectTrigger id="payment-member">
                  <SelectValue placeholder="Chọn thành viên" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-amount" className="text-right">
              Số tiền (VND)
            </Label>
            <Input
              id="payment-amount"
              type="number"
              min="0"
              step="1000"
              value={newPayment.amount}
              onChange={(e) => handlePaymentChange("amount", Number.parseInt(e.target.value) || 0)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-date" className="text-right">
              Ngày thanh toán
            </Label>
            <div className="col-span-3">
              <DatePicker
                date={newPayment.payment_date}
                setDate={(date) => handlePaymentChange("payment_date", date)}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-method" className="text-right">
              Phương thức
            </Label>
            <div className="col-span-3">
              <Select
                value={newPayment.payment_method}
                onValueChange={(value) => handlePaymentChange("payment_method", value)}
              >
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Chọn phương thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
                  <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
                  <SelectItem value="Ví điện tử">Ví điện tử</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-notes" className="text-right">
              Ghi chú
            </Label>
            <Textarea
              id="payment-notes"
              value={newPayment.notes}
              onChange={(e) => handlePaymentChange("notes", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-proof" className="text-right">
              Ảnh chứng từ
            </Label>
            <div className="col-span-3">
              <Input
                id="payment-proof"
                type="file"
                accept="image/*"
                onChange={handleProofUpload}
                className="col-span-3"
              />
              {newPayment.payment_proof_url && (
                <div className="mt-2 relative w-full h-32 bg-slate-100 rounded-md overflow-hidden">
                  <img
                    src={newPayment.payment_proof_url || "/placeholder.svg"}
                    alt="Payment proof preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
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
