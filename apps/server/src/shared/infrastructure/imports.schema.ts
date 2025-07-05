import { pgEnum } from "drizzle-orm/pg-core";

export const ID_LENGTH = 36;

/**
 * Users
 */
export const userRoleEnum = pgEnum("role", ["admin", "customer", "kitchen"]);
