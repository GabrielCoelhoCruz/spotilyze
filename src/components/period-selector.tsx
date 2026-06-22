"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 3 months" },
  { value: "1y", label: "Last year" },
  { value: "all", label: "All time" },
]

export function PeriodSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const range = searchParams.get("range") ?? "30d"

  const handleValueChange = useCallback(
    (value: string | null) => {
      if (!value) return
      const params = new URLSearchParams(searchParams.toString())
      params.set("range", value)
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  return (
    <Select value={range} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px]" aria-label="Select time range">
        <SelectValue placeholder="Select range" />
      </SelectTrigger>
      <SelectContent>
        {RANGES.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
