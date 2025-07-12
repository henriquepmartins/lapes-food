import { pgEnum } from "drizzle-orm/pg-core";

export const ID_LENGTH = 36;

/**
 * Users
 */
export const userRoleEnum = pgEnum("role", [
  "admin",
  "customer",
  "kitchen",
  "driver",
]);

/**
 * Orders
 */
export const orderStatusEnum = pgEnum("status", [
  "active",
  "completed",
  "cancelled",
]);

export const ORDER_STATUSES = ["active", "completed", "cancelled"] as const;

/**
 * Delivery
 */
export const deliveryStatusEnum = pgEnum("status", [
  "pending",
  "in_progress",
  "delivered",
  "cancelled",
]);
