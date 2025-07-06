import { db } from "@/db";
import { menuCategoriesSchema } from "../domain/menu-category.schema";
import { and, count, ilike, or, eq } from "drizzle-orm";

export interface MenuCategoryRecord {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface CreateMenuCategoryParams {
  name: string;
  description: string;
}

export class MenuCategoryRepository {
  static async create(
    params: CreateMenuCategoryParams
  ): Promise<MenuCategoryRecord> {
    const [newCategory] = await db
      .insert(menuCategoriesSchema)
      .values(params)
      .returning();
    return newCategory;
  }

  static async getAll(params: {
    page: number;
    limit: number;
    query?: string;
  }): Promise<{ menuCategories: MenuCategoryRecord[]; total: number }> {
    const { page, limit, query } = params;
    const offset = (page - 1) * limit;
    const nameParts = query ? query.trim().split(" ") : [];

    const searchCondition = query
      ? or(
          and(
            ...nameParts.map((part) =>
              or(
                ilike(menuCategoriesSchema.name, `%${part}%`),
                ilike(menuCategoriesSchema.description, `%${part}%`)
              )
            )
          ),
          ilike(menuCategoriesSchema.name, `%${query}%`)
        )
      : undefined;

    const menuCategories = await db
      .select()
      .from(menuCategoriesSchema)
      .where(searchCondition)
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: count() })
      .from(menuCategoriesSchema)
      .where(searchCondition);

    const total = totalResult[0].count;

    return { menuCategories, total };
  }

  static async getById(id: string): Promise<MenuCategoryRecord | null> {
    const [category] = await db
      .select()
      .from(menuCategoriesSchema)
      .where(eq(menuCategoriesSchema.id, id));
    return category;
  }

  static async update(
    id: string,
    params: CreateMenuCategoryParams
  ): Promise<MenuCategoryRecord> {
    const [updatedCategory] = await db
      .update(menuCategoriesSchema)
      .set(params)
      .where(eq(menuCategoriesSchema.id, id))
      .returning();
    return updatedCategory;
  }

  static async delete(id: string): Promise<MenuCategoryRecord> {
    const [deletedCategory] = await db
      .delete(menuCategoriesSchema)
      .where(eq(menuCategoriesSchema.id, id))
      .returning();
    return deletedCategory;
  }
}
