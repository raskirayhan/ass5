import { BookingStatus } from "@prisma/client";
import { BOOKING_STATUS_TRANSITIONS } from "../constants";

export function canTransitionStatus(
  current: BookingStatus,
  next: BookingStatus
): boolean {
  const allowed = BOOKING_STATUS_TRANSITIONS[current];
  return allowed ? allowed.includes(next) : false;
}

export function sanitizeUser(user: any) {
  const { password, ...rest } = user;
  return rest;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
