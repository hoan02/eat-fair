import { AddPaymentForm } from "./add-payment-form"

export function PaymentsHeader() {
  return (
    <div className="flex items-center justify-between space-y-2">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Thanh toán</h2>
        <p className="text-muted-foreground">Quản lý các khoản thanh toán của thành viên</p>
      </div>
      <AddPaymentForm />
    </div>
  )
}
