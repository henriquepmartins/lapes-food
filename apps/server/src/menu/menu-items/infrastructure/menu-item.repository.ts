import { db } from "@/db";
import { menuItems } from "../domain/menu-item.schema";
import { and, count, ilike, or, eq } from "drizzle-orm";

export interface MenuItemRecord {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  isAvailable: number;
  createdAt: Date;
  updatedAt: Date | null;
  slug: string;
}

export interface CreateMenuItemParams {
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  isAvailable: number;
  slug: string;
}

export class MenuItemRepository {
  static async create(params: CreateMenuItemParams): Promise<MenuItemRecord> {
    const [newItem] = await db.insert(menuItems).values(params).returning();
    return newItem;
  }

  static async getAll(params: {
    page: number;
    limit: number;
    query?: string;
  }): Promise<{ menuItems: MenuItemRecord[]; total: number }> {
    const { page, limit, query } = params;
    const offset = (page - 1) * limit;
    const nameParts = query ? query.trim().split(" ") : [];

    const searchCondition = query
      ? or(
          and(
            ...nameParts.map((part) =>
              or(
                ilike(menuItems.name, `%${part}%`),
                ilike(menuItems.description, `%${part}%`)
              )
            )
          ),
          ilike(menuItems.name, `%${query}%`)
        )
      : undefined;

    const menuItemCategory = await db
      .select()
      .from(menuItems)
      .where(searchCondition)
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: count() })
      .from(menuItems)
      .where(searchCondition);

    const total = totalResult[0].count;

    return { menuItems: menuItemCategory, total };
  }

  static async getById(id: string): Promise<MenuItemRecord | null> {
    const [item] = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, id));
    return item;
  }

  static async update(
    id: string,
    params: CreateMenuItemParams
  ): Promise<MenuItemRecord> {
    const [updatedItem] = await db
      .update(menuItems)
      .set(params)
      .where(eq(menuItems.id, id))
      .returning();
    return updatedItem;
  }

  static async delete(id: string): Promise<MenuItemRecord> {
    const [deletedItem] = await db
      .delete(menuItems)
      .where(eq(menuItems.id, id))
      .returning();
    return deletedItem;
  }
}
