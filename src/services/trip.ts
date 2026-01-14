import type { Trip, TripActivity, TripDay } from "@/entities/trip"
import { typeSafeRequest } from "@/shared/lib/http"
import type {
  AddActivityPayload,
  AddTripDayPayload,
  CreateTripPayload,
  UpdateTripPayload,
} from "@/shared/schema/trip"
import type { ApiRequestPayload } from "@/shared/types/http"

export async function listUserTrips(
  payload: ApiRequestPayload<
    undefined,
    { status?: string; limit?: number; offset?: number }
  >,
) {
  return await typeSafeRequest<
    undefined,
    { status?: string; limit?: number; offset?: number },
    { trips: Trip[]; total: number }
  >({
    url: "api/v1/trips",
    method: "get",
    payload,
  })
}

export async function getTripById(
  payload: ApiRequestPayload<undefined, { tripId: number }>,
) {
  return await typeSafeRequest<undefined, { tripId: number }, Trip>({
    url: `api/v1/trips/${payload.params?.tripId}`,
    method: "get",
  })
}

export async function createTrip(
  payload: ApiRequestPayload<CreateTripPayload>,
) {
  return await typeSafeRequest<CreateTripPayload, undefined, Trip>({
    url: "api/v1/trips",
    method: "post",
    payload,
  })
}

export async function updateTrip(
  payload: ApiRequestPayload<UpdateTripPayload, { tripId: number }>,
) {
  return await typeSafeRequest<UpdateTripPayload, { tripId: number }, Trip>({
    url: `api/v1/trips/${payload.params?.tripId}`,
    method: "patch",
    payload,
  })
}

export async function deleteTrip(
  payload: ApiRequestPayload<undefined, { tripId: number }>,
) {
  return await typeSafeRequest<
    undefined,
    { tripId: number },
    { success: boolean }
  >({
    url: `api/v1/trips/${payload.params?.tripId}`,
    method: "delete",
    payload,
  })
}

export async function addDayToTrip(
  payload: ApiRequestPayload<AddTripDayPayload, { tripId: number }>,
) {
  return await typeSafeRequest<AddTripDayPayload, { tripId: number }, TripDay>({
    url: `api/v1/trips/${payload.params?.tripId}/days`,
    method: "post",
    payload,
  })
}

export async function addActivityToDay(
  payload: ApiRequestPayload<
    AddActivityPayload,
    { tripId: number; dayId: number }
  >,
) {
  return await typeSafeRequest<
    AddActivityPayload,
    { tripId: number; dayId: number },
    TripActivity
  >({
    url: `api/v1/trips/${payload.params?.tripId}/days/${payload.params?.dayId}/activities`,
    method: "post",
    payload,
  })
}

export async function updateActivity(
  payload: ApiRequestPayload<
    Partial<AddActivityPayload>,
    { tripId: number; activityId: number }
  >,
) {
  return await typeSafeRequest<
    Partial<AddActivityPayload>,
    { tripId: number; activityId: number },
    TripActivity
  >({
    url: `api/v1/trips/${payload.params?.tripId}/activities/${payload.params?.activityId}`,
    method: "patch",
    payload,
  })
}

export async function deleteActivity(
  payload: ApiRequestPayload<undefined, { tripId: number; activityId: number }>,
) {
  return await typeSafeRequest<
    undefined,
    { tripId: number; activityId: number },
    { success: boolean }
  >({
    url: `api/v1/trips/${payload.params?.tripId}/activities/${payload.params?.activityId}`,
    method: "delete",
    payload,
  })
}

export async function reorderActivities(
  payload: ApiRequestPayload<{ activity_ids: number[] }, { tripId: number }>,
) {
  return await typeSafeRequest<
    { activity_ids: number[] },
    { tripId: number },
    { message: string }
  >({
    url: `api/v1/trips/${payload.params?.tripId}/activities/reorder`,
    method: "post",
    payload,
  })
}
