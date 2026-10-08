"use client"

import * as React from "react"
import { Popover } from "@base-ui/react/popover"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type DatePickerType = "date" | "month" | "datetime-local"

interface DatePickerInputProps {
  value: string
  onValueChange: (value: string) => void
  label?: React.ReactNode
  type?: DatePickerType
  id?: string
  className?: string
  labelClassName?: string
  inputClassName?: string
  disabled?: boolean
  required?: boolean
  min?: string
  max?: string
}

const MONTHS = Array.from({ length: 12 }, (_, month) =>
  new Date(2020, month, 1).toLocaleDateString("en-US", { month: "short" })
)

export function DatePickerInput({
  value,
  onValueChange,
  label,
  type = "date",
  id,
  className,
  labelClassName,
  inputClassName,
  disabled,
  required,
  min,
  max,
}: DatePickerInputProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const inputRef = React.useRef<HTMLInputElement>(null)
  const selectedMonthMatch = /^(\d{4})-(\d{2})$/.exec(value)
  const selectedYear = selectedMonthMatch ? Number(selectedMonthMatch[1]) : undefined
  const selectedMonth = selectedMonthMatch ? Number(selectedMonthMatch[2]) - 1 : undefined
  const [monthPickerOpen, setMonthPickerOpen] = React.useState(false)
  const [viewYear, setViewYear] = React.useState(selectedYear ?? new Date().getFullYear())

  const openPicker = () => {
    const input = inputRef.current
    if (!input || disabled) return

    if (typeof input.showPicker === "function") {
      input.showPicker()
    } else {
      input.focus()
    }
  }

  if (type === "month") {
    const formattedValue =
      selectedYear !== undefined && selectedMonth !== undefined
        ? new Date(selectedYear, selectedMonth, 1).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        : "Select month"

    return (
      <div className={cn("grid gap-1.5", className)}>
        {label ? (
          <label
            htmlFor={inputId}
            className={cn("text-xs font-bold text-muted-foreground", labelClassName)}
          >
            {label}
          </label>
        ) : null}
        <Popover.Root
          open={monthPickerOpen}
          onOpenChange={(open) => {
            setMonthPickerOpen(open)
            if (open) setViewYear(selectedYear ?? new Date().getFullYear())
          }}
        >
          <Popover.Trigger
            render={
              <Button
                id={inputId}
                type="button"
                variant="outline"
                disabled={disabled}
                className={cn("min-w-36 justify-between font-normal", inputClassName)}
              />
            }
          >
            <span>{formattedValue}</span>
            <CalendarIcon aria-hidden="true" />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner sideOffset={6} align="end" className="isolate z-50 outline-none">
              <Popover.Popup className="w-64 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
                <Popover.Title className="sr-only">Select forecast month</Popover.Title>
                <div className="mb-3 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setViewYear((year) => year - 1)}
                    aria-label="Previous year"
                  >
                    <ChevronLeftIcon />
                  </Button>
                  <span className="text-sm font-bold">{viewYear}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setViewYear((year) => year + 1)}
                    aria-label="Next year"
                  >
                    <ChevronRightIcon />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {MONTHS.map((monthName, monthIndex) => {
                    const monthValue = `${viewYear}-${String(monthIndex + 1).padStart(2, "0")}`
                    const isSelected = monthValue === value
                    const outsideRange = (min !== undefined && monthValue < min.slice(0, 7)) ||
                      (max !== undefined && monthValue > max.slice(0, 7))

                    return (
                      <Button
                        key={monthName}
                        type="button"
                        size="sm"
                        variant={isSelected ? "default" : "ghost"}
                        disabled={outsideRange}
                        aria-pressed={isSelected}
                        onClick={() => {
                          onValueChange(monthValue)
                          setMonthPickerOpen(false)
                        }}
                      >
                        {monthName}
                      </Button>
                    )
                  })}
                </div>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </div>
    )
  }

  return (
    <div className={cn("grid gap-1.5", className)}>
      {label ? (
        <label
          htmlFor={inputId}
          className={cn("text-xs font-bold text-muted-foreground", labelClassName)}
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <Input
          ref={inputRef}
          id={inputId}
          type={type}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          className={cn("date-picker-input pr-9", inputClassName)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={openPicker}
          disabled={disabled}
          className="absolute right-1 top-1/2 -translate-y-1/2"
          aria-label={`Select ${type === "datetime-local" ? "date and time" : "date"}`}
        >
          <CalendarIcon aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
