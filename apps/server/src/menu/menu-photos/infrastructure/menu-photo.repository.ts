import { db } from "@/db";
import { MenuPhotoSchema } from "../domain/menu-photo.schema";
import { eq } from "drizzle-orm";

export interface MenuPhotoRecord {
  id: string;
  menuItemId: string;
  ext: string;
}

export class MenuPhotoRepository {
  static async create(params: {
    id: string;
    menuItemId: string;
    ext: string;
  }): Promise<MenuPhotoRecord> {
    const [newPhoto] = await db
      .insert(MenuPhotoSchema)
      .values(params)
      .returning();
    return newPhoto;
  }

  static async delete(id: string): Promise<MenuPhotoRecord> {
    const [deletedPhoto] = await db
      .delete(MenuPhotoSchema)
      .where(eq(MenuPhotoSchema.id, id))
      .returning();
    return deletedPhoto;
  }

  static async getById(id: string): Promise<MenuPhotoRecord | null> {
    const [photo] = await db
      .select()
      .from(MenuPhotoSchema)
      .where(eq(MenuPhotoSchema.id, id));
    return photo ?? null;
  }
}
