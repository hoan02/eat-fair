import { format, parseISO } from "date-fns"
import { getPayments } from "@/app/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export async function RecentPayments() {
  try {
    const payments = await getPayments(5) // Get latest 5 payments

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Thanh toán gần đây</CardTitle>
          <CardDescription>5 khoản thanh toán mới nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Thành viên</TableHead>
                <TableHead>Phương thức</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!payments || payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Chưa có khoản thanh toán nào
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="font-medium">{format(parseISO(payment.payment_date), "dd/MM/yyyy")}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={payment.user?.avatar_url || "/placeholder.svg"}
                            alt={payment.user?.full_name}
                          />
                          <AvatarFallback className="text-xs">
                            {payment.user?.full_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{payment.user?.full_name || "Không xác định"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {payment.payment_method || "Chuyển khoản"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(payment.amount)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error("Error loading recent payments:", error)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thanh toán gần đây</CardTitle>
          <CardDescription>5 khoản thanh toán mới nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Không thể tải dữ liệu thanh toán</div>
        </CardContent>
      </Card>
    )
  }
}
