import { db } from "@/db";
import { DeliverySchema } from "../domain/delivery.schema";
import { ilike, and, or, eq, count } from "drizzle-orm";
import { deliveryStatusEnum } from "@/shared/infrastructure/imports.schema";
import { usersSchema } from "@/users/domain/user.schema";
import type { UserRecord } from "@/users/infrastructure/user.repository";
import { OrderRepository } from "@/orders/infrastructure/order.repository";
// import cep from "cep-promise"; // Lembre-se de instalar: npm install cep-promise
let cep: any;
try {
  cep = require("cep-promise");
} catch {}

export interface DeliveryRecord {
  id: string;
  orderId: string;
  deliveryDriverId: string;
  price: number;
  status: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface CreateDeliveryParams {
  orderId: string;
  deliveryDriverId: string;
  price: number;
  status: "pending" | "in_progress" | "delivered" | "cancelled";
}

export type AddressDelivery = {
  cep: string | null;
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  complemento: string | null;
};

export class DeliveryRepository {
  static async create(params: CreateDeliveryParams): Promise<DeliveryRecord> {
    const [delivery] = await db
      .insert(DeliverySchema)
      .values(params)
      .returning();
    return delivery;
  }

  static async getAll(params: {
    page: number;
    limit: number;
    query?: string;
    user?: { id: string; role: string };
  }): Promise<{ deliveries: DeliveryRecord[]; total: number }> {
    const { page, limit, query, user } = params;
    const offset = (page - 1) * limit;
    const nameParts = query ? query.trim().split(" ") : [];

    const searchCondition = query
      ? or(
          and(
            ...nameParts.map((part) =>
              or(ilike(DeliverySchema.id, `%${part}%`))
            )
          ),
          ilike(DeliverySchema.id, `%${query}%`)
        )
      : undefined;

    let whereCondition = searchCondition;
    if (user) {
      if (user.role === "customer") {
        whereCondition = whereCondition
          ? and(whereCondition, eq(DeliverySchema.orderId, user.id))
          : eq(DeliverySchema.orderId, user.id);
      } else if (user.role === "kitchen") {
        whereCondition = whereCondition
          ? and(whereCondition, eq(DeliverySchema.status, "pending"))
          : eq(DeliverySchema.status, "pending");
      }
    }

    const deliveries = await db
      .select()
      .from(DeliverySchema)
      .where(whereCondition)
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: count() })
      .from(DeliverySchema)
      .where(whereCondition);

    const total = totalResult[0].count;

    return { deliveries, total };
  }

  static async getById(id: string): Promise<DeliveryRecord | null> {
    const [delivery] = await db
      .select()
      .from(DeliverySchema)
      .where(eq(DeliverySchema.id, id));
    return delivery;
  }

  static async update(
    id: string,
    params: CreateDeliveryParams
  ): Promise<DeliveryRecord> {
    const [delivery] = await db
      .update(DeliverySchema)
      .set(params)
      .where(eq(DeliverySchema.id, id))
      .returning();
    return delivery;
  }

  static async delete(id: string): Promise<DeliveryRecord> {
    const [delivery] = await db
      .delete(DeliverySchema)
      .where(eq(DeliverySchema.id, id))
      .returning();
    return delivery;
  }

  static getDeliveryStatuses(): string[] {
    return [...deliveryStatusEnum.enumValues];
  }

  static async deliveryFee(orderId: string): Promise<number> {
    const order = await OrderRepository.getById(orderId);
    if (!order) throw new Error("Order not found");
    return order.price;
  }

  static async getDeliveryAreas(): Promise<AddressDelivery[]> {
    const customers = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.role, "customer"));
    const uniqueAddresses = new Map<string, AddressDelivery>();
    for (const user of customers) {
      const key = [
        user.cep,
        user.rua,
        user.numero,
        user.bairro,
        user.cidade,
        user.estado,
        user.complemento,
      ].join("|");
      if (!uniqueAddresses.has(key)) {
        uniqueAddresses.set(key, {
          cep: user.cep,
          rua: user.rua,
          numero: user.numero,
          bairro: user.bairro,
          cidade: user.cidade,
          estado: user.estado,
          complemento: user.complemento,
        });
      }
    }
    return Array.from(uniqueAddresses.values());
  }

  static async calculateDeliveryFee(
    originCep: string,
    destinationCep: string
  ): Promise<number> {
    if (!cep) throw new Error("cep-promise não está instalado");
    const [origin, destination] = await Promise.all([
      cep(originCep),
      cep(destinationCep),
    ]);
    const distance = Math.abs(Number(origin.cep) - Number(destination.cep));
    return 5 + distance * 0.01;
  }

  static async updateDeliveryStatus(
    deliveryId: string,
    status: "pending" | "in_progress" | "delivered" | "cancelled"
  ) {
    const [delivery] = await db
      .update(DeliverySchema)
      .set({ status })
      .where(eq(DeliverySchema.id, deliveryId))
      .returning();
    return delivery;
  }

  static async getAvailableDrivers(): Promise<UserRecord[]> {
    return db.select().from(usersSchema).where(eq(usersSchema.role, "driver"));
  }
}
