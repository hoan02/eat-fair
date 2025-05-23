"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { Plus, Trash2, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addPayment, deletePayment } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function PaymentsTab({ payments, members, loading }) {
  // Thêm vào đầu component
  const [sortOrder, setSortOrder] = useState("desc")
  const [sortedPayments, setSortedPayments] = useState(payments)
  const [isAddingPayment, setIsAddingPayment] = useState(false)
  const [newPayment, setNewPayment] = useState({
    member_id: "",
    amount: 0,
    payment_date: new Date().toISOString(),
    payment_method: "Chuyển khoản",
    payment_proof_url: "",
    notes: "",
  })
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  // Handle payment form changes
  const handlePaymentChange = (field, value) => {
    setNewPayment((prev) => ({ ...prev, [field]: value }))
  }

  // Handle payment proof upload
  const handlePaymentProofUpload = (e) => {
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

  // Add payment
  const handleSavePayment = async () => {
    if (!newPayment.member_id || !newPayment.amount) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn thành viên và nhập số tiền",
        variant: "destructive",
      })
      return
    }

    try {
      await addPayment(newPayment)
      toast({
        title: "Thêm thành công",
        description: "Đã thêm khoản thanh toán mới",
      })
      resetPaymentForm()
      // Reload the page to refresh data
      window.location.reload()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi lưu khoản thanh toán",
        variant: "destructive",
      })
    }
  }

  // Delete payment
  const handleDeletePayment = async (id) => {
    try {
      await deletePayment(id)
      toast({
        title: "Xóa thành công",
        description: "Đã xóa khoản thanh toán",
      })
      // Reload the page to refresh data
      window.location.reload()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi xóa khoản thanh toán",
        variant: "destructive",
      })
    }
  }

  // Reset payment form
  const resetPaymentForm = () => {
    setNewPayment({
      member_id: "",
      amount: 0,
      payment_date: new Date().toISOString(),
      payment_method: "Chuyển khoản",
      payment_proof_url: "",
      notes: "",
    })
    setIsAddingPayment(false)
  }

  // Preview image
  const handlePreviewImage = (imageUrl) => {
    setPreviewImage(imageUrl)
    setIsPreviewOpen(true)
  }

  // Get member name by ID
  const getMemberName = (memberId) => {
    const member = members.find((m) => m.id === memberId)
    return member ? member.name : "Unknown"
  }

  // Thêm useEffect để sắp xếp
  useEffect(() => {
    const sorted = [...payments].sort((a, b) => {
      const dateA = new Date(a.payment_date)
      const dateB = new Date(b.payment_date)
      return sortOrder === "desc" ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime()
    })
    setSortedPayments(sorted)
  }, [payments, sortOrder])

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
        <div>
          <CardTitle>Lịch Sử Thanh Toán</CardTitle>
          <CardDescription className="text-blue-100">Theo dõi các khoản thanh toán của thành viên</CardDescription>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setIsAddingPayment(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm thanh toán
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead
                  className="cursor-pointer hover:bg-slate-100"
                  onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                >
                  <div className="flex items-center">
                    Ngày
                    {sortOrder === "desc" ? " ↓" : " ↑"}
                  </div>
                </TableHead>
                <TableHead>Thành viên</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead>Phương thức</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : sortedPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Chưa có khoản thanh toán nào
                  </TableCell>
                </TableRow>
              ) : (
                sortedPayments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div className="font-medium">{format(parseISO(payment.payment_date), "dd/MM/yyyy HH:mm")}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={payment.members?.avatar_url || "/placeholder.svg"}
                            alt={payment.members?.name}
                          />
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                            {payment.members?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{payment.members?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{payment.payment_method || "Chuyển khoản"}</TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      <div className="flex items-center gap-2">
                        {payment.payment_proof_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => handlePreviewImage(payment.payment_proof_url)}
                          >
                            <ImageIcon className="h-4 w-4 text-blue-500" />
                          </Button>
                        )}
                        <span>{payment.notes}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePayment(payment.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 py-3 px-6 flex justify-between">
        <div className="text-sm text-slate-500">Hiển thị {sortedPayments.length} khoản thanh toán</div>
        <div className="font-medium">
          Tổng: {formatCurrency(sortedPayments.reduce((sum, payment) => sum + Number(payment.amount), 0))}
        </div>
      </CardFooter>

      {/* Add Payment Dialog */}
      <Dialog
        open={isAddingPayment}
        onOpenChange={(open) => {
          if (!open) resetPaymentForm()
          setIsAddingPayment(open)
        }}
      >
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
                  date={newPayment.payment_date ? parseISO(newPayment.payment_date) : undefined}
                  setDate={(date) => handlePaymentChange("payment_date", date ? date.toISOString() : null)}
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
                <div className="flex items-center gap-4">
                  <Input
                    id="payment-proof"
                    type="file"
                    accept="image/*"
                    onChange={handlePaymentProofUpload}
                    className="col-span-3"
                  />
                  {newPayment.payment_proof_url && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handlePreviewImage(newPayment.payment_proof_url)}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
            <Button variant="outline" onClick={resetPaymentForm}>
              Hủy
            </Button>
            <Button
              onClick={handleSavePayment}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              Thêm mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
          <div className="relative w-full h-[500px] bg-slate-900 flex items-center justify-center">
            {previewImage && (
              <img
                src={previewImage || "/placeholder.svg"}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
