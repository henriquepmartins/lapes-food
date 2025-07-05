import { db } from "@/db";
import { usersSchema } from "@/users/domain/user.schema";
import { and, count, eq, ilike, or, sql, sum } from "drizzle-orm";

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  password: string | null;
  email: string;
  role: "admin" | "customer" | "kitchen";
  createdAt: Date;
  updatedAt: Date | null;
}

export interface CreateUserParams {
  firstName: string;
  lastName: string;
  password: string | undefined | null;
  email: string;
  role: "admin" | "customer" | "kitchen";
}

export class UserRepository {
  static async create(data: CreateUserParams): Promise<UserRecord> {
    const [newUser] = await db
      .insert(usersSchema)
      .values({ ...data, email: data.email.toLowerCase() })
      .returning();

    return newUser;
  }

  static async getAll(params: {
    page: number;
    limit: number;
    query?: string;
  }): Promise<{ users: UserRecord[]; total: number }> {
    const { page, limit, query } = params;
    const offset = (page - 1) * limit;
    const nameParts = query ? query.trim().split(" ") : [];

    const searchCondition = query
      ? or(
          and(
            ...nameParts.map((part) =>
              or(
                ilike(usersSchema.firstName, `%${part}%`),
                ilike(usersSchema.lastName, `%${part}%`)
              )
            )
          ),
          ilike(usersSchema.email, `%${query}%`)
        )
      : undefined;

    const users = await db
      .select()
      .from(usersSchema)
      .where(searchCondition)
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: count() })
      .from(usersSchema)
      .where(searchCondition);

    const total = totalResult[0].count;

    return { users, total };
  }

  static async getByEmail(email: string): Promise<UserRecord | null> {
    const [user] = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.email, email.toLowerCase()));

    return user;
  }

  static async getById(id: string): Promise<UserRecord | null> {
    const [user] = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.id, id));

    return user;
  }

  static async update(
    id: string,
    data: Partial<CreateUserParams>
  ): Promise<UserRecord> {
    const [updatedUser] = await db
      .update(usersSchema)
      .set({ ...data })
      .where(eq(usersSchema.id, id))
      .returning();

    return updatedUser;
  }

  static async delete(id: string): Promise<UserRecord> {
    const [deletedUser] = await db
      .delete(usersSchema)
      .where(eq(usersSchema.id, id))
      .returning();

    return deletedUser;
  }
}
