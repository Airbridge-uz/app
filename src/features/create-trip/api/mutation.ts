import type { Trip } from "@/entities/trip"
import { createTrip } from "@/services/trip"
import type { CreateTripPayload } from "@/shared/schema/trip"
import type { ApiError } from "@/shared/types/http"
import { createMutation } from "react-query-kit"

export const createTripMutation = createMutation<
  Trip,
  CreateTripPayload,
  ApiError
>({
  mutationFn: async (payload) => {
    const result = await createTrip({
      body: payload,
    })
    if (result.isErr()) {
      throw result.error
    }
    return result.value
  },
  mutationKey: ["create-trip"],
})
