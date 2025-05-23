"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { deleteExpense } from "@/app/actions"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ImageIcon } from "lucide-react"
import { EditExpenseDialog } from "./edit-expense-dialog"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

export function ExpensesTable({ initialExpenses }) {
  const router = useRouter()
  const [expenses, setExpenses] = useState(initialExpenses || [])
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState(null)
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense)
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return

    try {
      await deleteExpense(expenseToDelete.id)
      setExpenses(expenses.filter((e) => e.id !== expenseToDelete.id))
      toast({
        title: "Xóa thành công",
        description: "Đã xóa khoản chi tiêu",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi xóa khoản chi",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setExpenseToDelete(null)
    }
  }

  const handleEditSuccess = () => {
    router.refresh()
  }

  const handlePreviewImage = (imageUrl) => {
    setPreviewImage(imageUrl)
    setIsImagePreviewOpen(true)
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Ngày</TableHead>
                  <TableHead>Món ăn</TableHead>
                  <TableHead>Người tạo</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                  <TableHead>Người tham gia</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!expenses || expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Chưa có khoản chi tiêu nào
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <div className="font-medium">{format(parseISO(expense.date), "dd/MM/yyyy")}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {expense.receipt_image_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={() => handlePreviewImage(expense.receipt_image_url)}
                            >
                              <ImageIcon className="h-4 w-4 text-teal-500" />
                            </Button>
                          )}
                          <span>{expense.food_item}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={expense.members?.avatar_url || "/placeholder.svg"}
                              alt={expense.members?.name}
                            />
                            <AvatarFallback className="text-xs">
                              {expense.members?.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{expense.members?.name || "Không xác định"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{expense.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(expense.unit_price)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(expense.total_price)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {expense.participants?.length || 0} người
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditExpense(expense)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(expense)}>
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
      </Card>

      {selectedExpense && (
        <EditExpenseDialog
          expense={selectedExpense}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khoản chi tiêu này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
        <AlertDialogContent className="max-w-3xl p-0">
          <div className="relative w-full h-[500px] bg-slate-900 flex items-center justify-center">
            {previewImage && (
              <img
                src={previewImage || "/placeholder.svg"}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
          <AlertDialogFooter className="p-4">
            <AlertDialogCancel>Đóng</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
