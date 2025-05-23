import { AddExpenseForm } from "./add-expense-form"

export function ExpensesHeader() {
  return (
    <div className="flex items-center justify-between space-y-2">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Chi tiêu</h2>
        <p className="text-muted-foreground">Quản lý các khoản chi tiêu tiền ăn</p>
      </div>
      <AddExpenseForm />
    </div>
  )
}
