"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { deletePayment } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export function DeletePaymentDialog({ payment }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      await deletePayment(payment.id)
      toast({
        title: "Xóa thành công",
        description: "Đã xóa khoản thanh toán",
      })
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi xóa khoản thanh toán",
        variant: "destructive",
      })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa khoản thanh toán này? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
