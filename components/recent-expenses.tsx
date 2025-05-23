import { format, parseISO } from "date-fns"
import { getExpenses } from "@/app/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export async function RecentExpenses() {
  try {
    const expenses = await getExpenses(5) // Get latest 5 expenses

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Chi tiêu gần đây</CardTitle>
          <CardDescription>5 khoản chi tiêu mới nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Món ăn</TableHead>
                <TableHead>Người tạo</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!expenses || expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Chưa có khoản chi tiêu nào
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div className="font-medium">{format(parseISO(expense.date), "dd/MM/yyyy")}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{expense.food_item}</div>
                      <div className="text-sm text-muted-foreground">
                        {expense.quantity} x {formatCurrency(expense.unit_price)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={expense.creator?.avatar_url || "/placeholder.svg"}
                            alt={expense.creator?.full_name}
                          />
                          <AvatarFallback className="text-xs">
                            {expense.creator?.full_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{expense.creator?.full_name || "Không xác định"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(expense.total_price)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error("Error loading recent expenses:", error)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chi tiêu gần đây</CardTitle>
          <CardDescription>5 khoản chi tiêu mới nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Không thể tải dữ liệu chi tiêu</div>
        </CardContent>
      </Card>
    )
  }
}
