import { subDays, startOfDay, endOfDay } from "date-fns"

export const presets = {
  today: () => ({
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  }),
  last7: () => ({
    from: startOfDay(subDays(new Date(), 6)),
    to: endOfDay(new Date())
  }),
  last30: () => ({
    from: startOfDay(subDays(new Date(), 29)),
    to: endOfDay(new Date())
  })
}