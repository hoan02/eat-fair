"use client"

import { useState, useEffect } from "react"
import { format, parseISO, startOfMonth, endOfMonth, getYear } from "date-fns"
import { Plus, Trash2, Edit, Filter, ImageIcon, Loader2 } from "lucide-react"
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
import { addExpense, updateExpense, deleteExpense } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

export function ExpensesTab({ expenses, loading }) {
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [isEditingExpense, setIsEditingExpense] = useState(false)
  const [currentExpense, setCurrentExpense] = useState(null)
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split("T")[0],
    food_item: "",
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    notes: "",
    receipt_image_url: "",
  })
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filterOptions, setFilterOptions] = useState({})
  const [filteredExpenses, setFilteredExpenses] = useState(expenses)
  const [sortOrder, setSortOrder] = useState("desc") // 'asc' hoặc 'desc'

  // Thêm state cho filter theo tháng/năm
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState("")

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
  }

  // Get available years from expenses
  const getAvailableYears = () => {
    const years = new Set()
    expenses.forEach((expense) => {
      years.add(getYear(parseISO(expense.date)))
    })
    const currentYear = getYear(new Date())
    years.add(currentYear)
    return Array.from(years).sort((a, b) => b - a)
  }

  // Get available months
  const getAvailableMonths = () => {
    return [
      { value: "0", label: "Tháng 1" },
      { value: "1", label: "Tháng 2" },
      { value: "2", label: "Tháng 3" },
      { value: "3", label: "Tháng 4" },
      { value: "4", label: "Tháng 5" },
      { value: "5", label: "Tháng 6" },
      { value: "6", label: "Tháng 7" },
      { value: "7", label: "Tháng 8" },
      { value: "8", label: "Tháng 9" },
      { value: "9", label: "Tháng 10" },
      { value: "10", label: "Tháng 11" },
      { value: "11", label: "Tháng 12" },
    ]
  }

  // Handle expense form changes
  const handleExpenseChange = (field, value) => {
    setNewExpense((prev) => {
      const updated = { ...prev, [field]: value }

      // Auto-calculate total price when quantity or unit price changes
      if (field === "quantity" || field === "unit_price") {
        const quantity = field === "quantity" ? value : prev.quantity || 0
        const unitPrice = field === "unit_price" ? value : prev.unit_price || 0
        updated.total_price = quantity * unitPrice
      }

      return updated
    })
  }

  // Handle receipt image upload
  const handleReceiptUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewExpense((prev) => ({ ...prev, receipt_image_url: event.target.result }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Add or update expense
  const handleSaveExpense = async () => {
    if (!newExpense.food_item || !newExpense.quantity || !newExpense.unit_price) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin cần thiết",
        variant: "destructive",
      })
      return
    }

    try {
      if (isEditingExpense && currentExpense) {
        await updateExpense(currentExpense.id, newExpense)
        toast({
          title: "Cập nhật thành công",
          description: `Đã cập nhật khoản chi "${newExpense.food_item}"`,
        })
      } else {
        await addExpense(newExpense)
        toast({
          title: "Thêm thành công",
          description: `Đã thêm khoản chi "${newExpense.food_item}"`,
        })
      }
      resetExpenseForm()
      // Reload the page to refresh data
      window.location.reload()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi lưu khoản chi",
        variant: "destructive",
      })
    }
  }

  // Delete expense
  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpense(id)
      toast({
        title: "Xóa thành công",
        description: "Đã xóa khoản chi",
      })
      // Reload the page to refresh data
      window.location.reload()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi xóa khoản chi",
        variant: "destructive",
      })
    }
  }

  // Edit expense
  const handleEditExpense = (expense) => {
    setCurrentExpense(expense)
    setNewExpense({
      date: expense.date,
      food_item: expense.food_item,
      quantity: expense.quantity,
      unit_price: expense.unit_price,
      total_price: expense.total_price,
      notes: expense.notes || "",
      receipt_image_url: expense.receipt_image_url || "",
    })
    setIsEditingExpense(true)
    setIsAddingExpense(true)
  }

  // Reset expense form
  const resetExpenseForm = () => {
    setNewExpense({
      date: new Date().toISOString().split("T")[0],
      food_item: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      notes: "",
      receipt_image_url: "",
    })
    setCurrentExpense(null)
    setIsEditingExpense(false)
    setIsAddingExpense(false)
  }

  // Preview image
  const handlePreviewImage = (imageUrl) => {
    setPreviewImage(imageUrl)
    setIsPreviewOpen(true)
  }

  // Reset filters
  const resetFilters = () => {
    setFilterOptions({})
    setSelectedMonth("")
    setSelectedYear("")
  }

  // Filter by month/year
  const handleMonthYearFilter = () => {
    if (selectedMonth && selectedYear) {
      const year = Number.parseInt(selectedYear)
      const month = Number.parseInt(selectedMonth)
      const startDate = startOfMonth(new Date(year, month))
      const endDate = endOfMonth(new Date(year, month))

      setFilterOptions({
        startDate,
        endDate,
        date: undefined,
      })
    }
  }

  useEffect(() => {
    let filtered = [...expenses]

    // Lọc theo ngày cụ thể
    if (filterOptions.date) {
      const filterDate = format(filterOptions.date, "yyyy-MM-dd")
      filtered = filtered.filter((expense) => expense.date === filterDate)
    }

    // Lọc theo khoảng thời gian
    if (filterOptions.startDate && filterOptions.endDate) {
      const startDate = format(filterOptions.startDate, "yyyy-MM-dd")
      const endDate = format(filterOptions.endDate, "yyyy-MM-dd")
      filtered = filtered.filter((expense) => expense.date >= startDate && expense.date <= endDate)
    }

    // Sắp xếp theo ngày
    filtered.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return sortOrder === "desc" ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime()
    })

    setFilteredExpenses(filtered)
  }, [expenses, filterOptions, sortOrder])

  // Apply month/year filter when selected
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      handleMonthYearFilter()
    }
  }, [selectedMonth, selectedYear])

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-teal-500 to-emerald-500 text-white">
        <div>
          <CardTitle>Danh Sách Chi Tiêu</CardTitle>
          <CardDescription className="text-teal-100">Quản lý các khoản chi tiêu tiền ăn</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <Filter className="mr-2 h-4 w-4" /> Lọc
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setIsAddingExpense(true)}>
            <Plus className="mr-2 h-4 w-4" /> Thêm khoản chi
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="bg-white/50 backdrop-blur-sm p-4 border-b space-y-4">
              {/* Filter theo tháng/năm */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="filter-month">Tháng</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger id="filter-month" className="mt-1">
                      <SelectValue placeholder="Chọn tháng" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableMonths().map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filter-year">Năm</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger id="filter-year" className="mt-1">
                      <SelectValue placeholder="Chọn năm" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableYears().map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3">
                  <Label>Hoặc lọc theo ngày cụ thể</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-1">
                    <DatePicker
                      date={filterOptions.date}
                      setDate={(date) =>
                        setFilterOptions((prev) => ({
                          ...prev,
                          date,
                          startDate: undefined,
                          endDate: undefined,
                        }))
                      }
                      placeholder="Ngày cụ thể"
                    />
                    <DatePicker
                      date={filterOptions.startDate}
                      setDate={(date) => {
                        setFilterOptions((prev) => ({ ...prev, startDate: date, date: undefined }))
                        setSelectedMonth("")
                        setSelectedYear("")
                      }}
                      placeholder="Từ ngày"
                    />
                    <DatePicker
                      date={filterOptions.endDate}
                      setDate={(date) => {
                        setFilterOptions((prev) => ({ ...prev, endDate: date, date: undefined }))
                        setSelectedMonth("")
                        setSelectedYear("")
                      }}
                      placeholder="Đến ngày"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Xóa bộ lọc
                </Button>
              </div>
            </CardContent>
          </motion.div>
        )}
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
                <TableHead>Món ăn</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead className="text-right">Đơn giá</TableHead>
                <TableHead className="text-right">Thành tiền</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {expenses.length === 0
                      ? "Chưa có khoản chi tiêu nào"
                      : "Không tìm thấy khoản chi phù hợp với bộ lọc"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
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
                    <TableCell className="text-right">{expense.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(expense.unit_price)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(expense.total_price)}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{expense.notes}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditExpense(expense)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)}>
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
        <div className="text-sm text-slate-500">
          Hiển thị {filteredExpenses.length} / {expenses.length} khoản chi
        </div>
        <div className="font-medium">
          Tổng: {formatCurrency(filteredExpenses.reduce((sum, expense) => sum + Number(expense.total_price), 0))}
        </div>
      </CardFooter>

      {/* Add/Edit Expense Dialog */}
      <Dialog
        open={isAddingExpense}
        onOpenChange={(open) => {
          if (!open) resetExpenseForm()
          setIsAddingExpense(open)
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{isEditingExpense ? "Sửa khoản chi" : "Thêm khoản chi mới"}</DialogTitle>
            <DialogDescription>Nhập thông tin chi tiết về khoản chi tiêu</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
                <TabsTrigger value="additional">Thông tin bổ sung</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expense-date" className="text-right">
                    Ngày
                  </Label>
                  <div className="col-span-3">
                    <DatePicker
                      date={newExpense.date ? parseISO(newExpense.date) : undefined}
                      setDate={(date) => handleExpenseChange("date", date ? date.toISOString().split("T")[0] : null)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expense-food" className="text-right">
                    Món ăn
                  </Label>
                  <Input
                    id="expense-food"
                    value={newExpense.food_item}
                    onChange={(e) => handleExpenseChange("food_item", e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expense-quantity" className="text-right">
                    Số lượng
                  </Label>
                  <Input
                    id="expense-quantity"
                    type="number"
                    min="1"
                    value={newExpense.quantity}
                    onChange={(e) => handleExpenseChange("quantity", Number.parseInt(e.target.value) || 0)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expense-price" className="text-right">
                    Đơn giá (VND)
                  </Label>
                  <Input
                    id="expense-price"
                    type="number"
                    min="0"
                    step="1000"
                    value={newExpense.unit_price}
                    onChange={(e) => handleExpenseChange("unit_price", Number.parseInt(e.target.value) || 0)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expense-total" className="text-right">
                    Thành tiền
                  </Label>
                  <div className="col-span-3 font-medium">{formatCurrency(newExpense.total_price)}</div>
                </div>
              </TabsContent>
              <TabsContent value="additional" className="space-y-4 pt-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expense-notes" className="text-right">
                    Ghi chú
                  </Label>
                  <Textarea
                    id="expense-notes"
                    value={newExpense.notes}
                    onChange={(e) => handleExpenseChange("notes", e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expense-receipt" className="text-right">
                    Ảnh hóa đơn
                  </Label>
                  <div className="col-span-3">
                    <div className="flex items-center gap-4">
                      <Input
                        id="expense-receipt"
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptUpload}
                        className="col-span-3"
                      />
                      {newExpense.receipt_image_url && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handlePreviewImage(newExpense.receipt_image_url)}
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {newExpense.receipt_image_url && (
                      <div className="mt-2 relative w-full h-32 bg-slate-100 rounded-md overflow-hidden">
                        <img
                          src={newExpense.receipt_image_url || "/placeholder.svg"}
                          alt="Receipt preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetExpenseForm}>
              Hủy
            </Button>
            <Button
              onClick={handleSaveExpense}
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
            >
              {isEditingExpense ? "Cập nhật" : "Thêm mới"}
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
