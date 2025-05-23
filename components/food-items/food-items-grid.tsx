import { getFoodItems } from "@/app/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"

export async function FoodItemsGrid() {
  try {
    const foodItems = await getFoodItems()

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
    }

    // Group by category
    const groupedItems =
      foodItems?.reduce((acc, item) => {
        const category = item.category || "Khác"
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(item)
        return acc
      }, {}) || {}

    return (
      <div className="space-y-6">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Chưa có món ăn nào</div>
        ) : (
          Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-4">{category}</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      {item.image_url && (
                        <div className="relative w-full h-32 bg-slate-100 rounded-md overflow-hidden mb-3">
                          <img
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{item.name}</CardTitle>
                          <div className="mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-primary">{formatCurrency(item.default_price)}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    )
  } catch (error) {
    console.error("Error loading food items grid:", error)
    return <div className="text-center py-8 text-muted-foreground">Không thể tải dữ liệu món ăn</div>
  }
}
