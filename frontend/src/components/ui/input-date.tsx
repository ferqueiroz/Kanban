'use client'

import { useRef, useState } from 'react'
import {
  DatePicker,
  DateInput,
  DateSegment,
  Button as AriaButton,
  Group,
  Calendar,
  CalendarGrid,
  CalendarCell,
  CalendarGridHeader,
  CalendarGridBody,
  CalendarHeaderCell,
  Heading,
} from 'react-aria-components'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { parseDate } from '@internationalized/date'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import type { DateValue } from 'react-aria-components'
import { cn } from '../../lib/utils'

interface Props {
  value?: DateValue | null
  onChange?: (date: DateValue | null) => void
  isDisabled?: boolean
  isReadOnly?: boolean
  className?: string
  error?: string
}

export function isoToDateValue(iso?: string | null | undefined): DateValue | null {
  if (!iso) return null
  try { return parseDate(iso.substring(0, 10)) } catch { return null }
}

export function dateValueToIso(date: DateValue | null | undefined): string {
  return date ? date.toString() : ''
}

export function InputDate({
  value,
  onChange,
  isDisabled,
  isReadOnly,
  className,
  error,
}: Props) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <DatePicker
      value={value}
      onChange={(date) => {
        onChange?.(date)
        setOpen(false)
      }}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      className="flex flex-col gap-1.5 min-w-0"
    >
      <div className="grid gap-1.5">
        <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
          <Group
            className={cn(
              'flex items-center h-9 w-full min-w-0 rounded-md border bg-transparent dark:bg-input/30 px-3',
              'shadow-xs transition-[color,box-shadow]',
              error
                ? 'border-destructive focus-within:ring-[3px] focus-within:ring-destructive/50'
                : 'border-input focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
              isDisabled && 'opacity-50 pointer-events-none cursor-not-allowed',
              className
            )}
          >
            <DateInput className="flex flex-1 gap-0 min-w-0 overflow-hidden">
              {(segment) => (
                <DateSegment
                  segment={segment}
                  className="px-0.5 rounded text-sm outline-none
                    focus:bg-primary focus:text-primary-foreground
                    data-[placeholder]:text-muted-foreground"
                />
              )}
            </DateInput>

            {!isReadOnly && (
              <PopoverPrimitive.Trigger asChild>
                <AriaButton
                  ref={triggerRef}
                  onPress={() => setOpen((v) => !v)}
                  className="ml-2 shrink-0 text-muted-foreground hover:text-foreground outline-none"
                >
                  <CalendarIcon className="size-4" />
                </AriaButton>
              </PopoverPrimitive.Trigger>
            )}
          </Group>

          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              side="bottom"
              align="start"
              sideOffset={6}
              onOpenAutoFocus={(e) => e.preventDefault()}
              onInteractOutside={(e) => {
                if (triggerRef.current?.contains(e.target as Node)) {
                  e.preventDefault()
                }
              }}
              className="z-[9999] rounded-lg border bg-popover shadow-md p-3 outline-none"
            >
              <Calendar className="w-fit">
                <header className="flex items-center justify-between mb-3">
                  <AriaButton
                    slot="previous"
                    className="p-1 hover:bg-muted rounded outline-none"
                  >
                    <ChevronLeft className="size-4" />
                  </AriaButton>
                  <Heading className="text-sm font-medium" />
                  <AriaButton
                    slot="next"
                    className="p-1 hover:bg-muted rounded outline-none"
                  >
                    <ChevronRight className="size-4" />
                  </AriaButton>
                </header>

                <CalendarGrid>
                  <CalendarGridHeader>
                    {(day: string) => (
                      <CalendarHeaderCell className="text-xs text-muted-foreground w-8 pb-1 font-normal">
                        {day}
                      </CalendarHeaderCell>
                    )}
                  </CalendarGridHeader>
                  <CalendarGridBody>
                    {(date) => (
                      <CalendarCell
                        date={date}
                        className="size-8 text-sm flex items-center justify-center rounded cursor-pointer
                          hover:bg-muted
                          data-[selected]:bg-primary data-[selected]:text-primary-foreground
                          data-[today]:font-bold
                          data-[outside-month]:opacity-30
                          data-[disabled]:opacity-30 data-[disabled]:cursor-default
                          outline-none"
                      />
                    )}
                  </CalendarGridBody>
                </CalendarGrid>
              </Calendar>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>

        {error && (
          <span className="text-xs text-destructive">{error}</span>
        )}
      </div>
    </DatePicker>
  )
}