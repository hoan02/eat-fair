import { AddFoodItemForm } from "./add-food-item-form"

export function FoodItemsHeader() {
  return (
    <div className="flex items-center justify-between space-y-2">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Món ăn</h2>
        <p className="text-muted-foreground">Quản lý danh sách món ăn và giá tiền</p>
      </div>
      <AddFoodItemForm />
    </div>
  )
}
