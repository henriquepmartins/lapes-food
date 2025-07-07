import { db } from "@/db";
import { OrderSchema } from "../domain/order.schema";
import { count } from "drizzle-orm";
import { ilike, and, or, eq } from "drizzle-orm";
import { ORDER_STATUSES } from "@/shared/infrastructure/imports.schema";

export interface OrderRecord {
  id: string;
  title: string;
  price: number;
  orderNumber: number;
  status: string;
  createdAt: Date;
  updatedAt: Date | null;
  userId: string;
  description?: string | null;
}

export interface CreateOrderParams {
  title: string;
  price: number;
  orderNumber: number;
  status: "active" | "completed" | "cancelled";
  userId: string;
  description?: string | null;
}

export class OrderRepository {
  static async create(params: CreateOrderParams): Promise<OrderRecord> {
    const [order] = await db.insert(OrderSchema).values(params).returning();
    return order;
  }

  static async getAll(params: {
    page: number;
    limit: number;
    query?: string;
    user?: { id: string; role: string };
  }): Promise<{ orders: OrderRecord[]; total: number }> {
    const { page, limit, query, user } = params;
    const offset = (page - 1) * limit;
    const nameParts = query ? query.trim().split(" ") : [];

    const searchCondition = query
      ? or(
          and(
            ...nameParts.map((part) =>
              or(ilike(OrderSchema.title, `%${part}%`))
            )
          ),
          ilike(OrderSchema.title, `%${query}%`)
        )
      : undefined;

    let whereCondition = searchCondition;
    if (user) {
      if (user.role === "customer") {
        whereCondition = whereCondition
          ? and(whereCondition, eq(OrderSchema.userId, user.id))
          : eq(OrderSchema.userId, user.id);
      } else if (user.role === "kitchen") {
        whereCondition = whereCondition
          ? and(whereCondition, eq(OrderSchema.status, "active"))
          : eq(OrderSchema.status, "active");
      }
    }

    const orders = await db
      .select()
      .from(OrderSchema)
      .where(whereCondition)
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: count() })
      .from(OrderSchema)
      .where(whereCondition);

    const total = totalResult[0].count;

    return { orders, total };
  }

  static async getById(id: string): Promise<OrderRecord | null> {
    const [order] = await db
      .select()
      .from(OrderSchema)
      .where(eq(OrderSchema.id, id));
    return order;
  }

  static getOrderStatuses(): string[] {
    return [...ORDER_STATUSES];
  }

  static async update(
    id: string,
    params: CreateOrderParams
  ): Promise<OrderRecord> {
    const [order] = await db
      .update(OrderSchema)
      .set(params)
      .where(eq(OrderSchema.id, id))
      .returning();
    return order;
  }

  static async delete(id: string): Promise<OrderRecord> {
    const [order] = await db
      .delete(OrderSchema)
      .where(eq(OrderSchema.id, id))
      .returning();
    return order;
  }
}
