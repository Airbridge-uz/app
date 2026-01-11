import { getTripById, listUserTrips } from "@/services/trip"
import { createQuery } from "react-query-kit"
import type { FnParams } from "../types/utils"

export const useListUserTripsQuery = createQuery({
  queryKey: ["listUserTrips"],
  fetcher: async (variables: FnParams<typeof listUserTrips>) => {
    const result = await listUserTrips(variables)
    if (result.isErr())
      throw new Error(result.error.message, {
        cause: result.error.detail,
      })
    return result.value
  },
})

export const useGetTripByIdQuery = createQuery({
  queryKey: ["getTripById"],
  fetcher: async (variables: FnParams<typeof getTripById>) => {
    const result = await getTripById(variables)
    if (result.isErr())
      throw new Error(result.error.message, {
        cause: result.error.detail,
      })
    return result.value
  },
})
