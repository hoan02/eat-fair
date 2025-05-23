import { format, parseISO } from "date-fns"
import { getPayments } from "@/app/actions"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Edit, ImageIcon, Check } from "lucide-react"
import { DeletePaymentDialog } from "./delete-payment-dialog"

export async function PaymentsTable() {
  try {
    const payments = await getPayments()

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
    }

    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Ngày</TableHead>
                  <TableHead>Thành viên</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!payments || payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Chưa có khoản thanh toán nào
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
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
                            <AvatarFallback className="text-xs">
                              {payment.members?.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{payment.members?.name || "Không xác định"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {payment.payment_method || "Chuyển khoản"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.approved_by ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Check className="h-3 w-3 mr-1" />
                            Đã duyệt
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Chờ duyệt
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        <div className="flex items-center gap-2">
                          {payment.payment_proof_url && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                              <ImageIcon className="h-4 w-4 text-blue-500" />
                            </Button>
                          )}
                          <span>{payment.notes}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DeletePaymentDialog payment={payment} />
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
    )
  } catch (error) {
    console.error("Error loading payments table:", error)
    return (
      <Card>
        <CardContent className="p-0">
          <div className="text-center py-8 text-muted-foreground">Không thể tải dữ liệu thanh toán</div>
        </CardContent>
      </Card>
    )
  }
}
