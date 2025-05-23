"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/date-picker"
import { Button } from "@/components/ui/button"

export function ExpensesFilter() {
  const [filterOptions, setFilterOptions] = useState({
    startDate: undefined,
    endDate: undefined,
    month: "",
    year: "",
  })

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = [
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

  const resetFilters = () => {
    setFilterOptions({
      startDate: undefined,
      endDate: undefined,
      month: "",
      year: "",
    })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <Label htmlFor="filter-month">Tháng</Label>
            <Select
              value={filterOptions.month}
              onValueChange={(value) => setFilterOptions((prev) => ({ ...prev, month: value }))}
            >
              <SelectTrigger id="filter-month" className="mt-1">
                <SelectValue placeholder="Chọn tháng" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filter-year">Năm</Label>
            <Select
              value={filterOptions.year}
              onValueChange={(value) => setFilterOptions((prev) => ({ ...prev, year: value }))}
            >
              <SelectTrigger id="filter-year" className="mt-1">
                <SelectValue placeholder="Chọn năm" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Từ ngày</Label>
            <DatePicker
              date={filterOptions.startDate}
              setDate={(date) => setFilterOptions((prev) => ({ ...prev, startDate: date }))}
              placeholder="Từ ngày"
            />
          </div>
          <div>
            <Label>Đến ngày</Label>
            <DatePicker
              date={filterOptions.endDate}
              setDate={(date) => setFilterOptions((prev) => ({ ...prev, endDate: date }))}
              placeholder="Đến ngày"
            />
          </div>
          <div className="md:col-span-2 flex items-end gap-2">
            <Button variant="outline" onClick={resetFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
