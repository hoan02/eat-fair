"use client"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  maxDate?: Date
  placeholder?: string
}

export function DatePicker({ date, setDate, maxDate = new Date(), placeholder = "Chọn ngày" }: DatePickerProps) {
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Tạo ngày mới với giờ là 12:00 để tránh vấn đề timezone
      const localDate = new Date(selectedDate)
      localDate.setHours(12, 0, 0, 0)
      setDate(localDate)
    } else {
      setDate(undefined)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal transition-all",
            !date && "text-muted-foreground",
            date && "border-teal-300 text-teal-700",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          locale={vi}
          disabled={(date) => date > maxDate}
          className="rounded-md border border-teal-100"
        />
      </PopoverContent>
    </Popover>
  )
}
