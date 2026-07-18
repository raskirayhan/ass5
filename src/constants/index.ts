export const BOOKING_STATUS_TRANSITIONS: Record<string, string[]> = {
  REQUESTED: ["ACCEPTED", "DECLINED", "CANCELLED"],
  ACCEPTED: ["PAID", "CANCELLED"],
  PAID: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  DECLINED: [],
  CANCELLED: [],
};

export const SUCCESS_MESSAGES = {
  CREATED: "Created successfully",
  UPDATED: "Updated successfully",
  DELETED: "Deleted successfully",
  REGISTERED: "Registration successful",
  LOGGED_IN: "Login successful",
  PROFILE_FETCHED: "Profile fetched successfully",
  BOOKING_CREATED: "Booking created successfully",
  BOOKING_CANCELLED: "Booking cancelled successfully",
  PAYMENT_INITIATED: "Payment initiated successfully",
  PAYMENT_CONFIRMED: "Payment confirmed successfully",
  REVIEW_CREATED: "Review created successfully",
  USER_BANNED: "User banned successfully",
  USER_UNBANNED: "User unbanned successfully",
  STATUS_TOGGLED: "Status toggled successfully",
};
