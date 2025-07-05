import { db } from "@/db";
import { sessionsSchema } from "../domain/session.schema";
import { eq } from "drizzle-orm";

export type SessionRecord = {
  id: string;
  userId: string;
  ip: string;
  userAgent: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date | null;
};

export type SessionCreateParams = Omit<
  SessionRecord,
  "createdAt" | "updatedAt"
>;

export class SessionRepository {
  static async create(data: SessionCreateParams): Promise<SessionRecord> {
    const [session] = await db.insert(sessionsSchema).values(data).returning();

    return session;
  }

  static async findById(id: string): Promise<SessionRecord | null> {
    const [session] = await db
      .select()
      .from(sessionsSchema)
      .where(eq(sessionsSchema.id, id))
      .limit(1);

    return session;
  }

  static async findAllByUserId(
    userId: string
  ): Promise<SessionRecord[] | null> {
    const session = await db
      .select()
      .from(sessionsSchema)
      .where(eq(sessionsSchema.userId, userId));

    return session;
  }

  static async findAll(): Promise<SessionRecord[]> {
    const sessions = await db.select().from(sessionsSchema);

    return sessions;
  }

  static async updateById(
    id: string,
    data: Partial<SessionCreateParams>
  ): Promise<SessionRecord> {
    const [updatedSession] = await db
      .update(sessionsSchema)
      .set(data)
      .where(eq(sessionsSchema.id, id))
      .returning();

    return updatedSession;
  }

  static async deleteById(id: string): Promise<SessionRecord> {
    const [deletedSession] = await db
      .delete(sessionsSchema)
      .where(eq(sessionsSchema.id, id))
      .returning();

    return deletedSession;
  }

  static async deleteByUserId(userId: string): Promise<SessionRecord[]> {
    const deletedSessions = await db
      .delete(sessionsSchema)
      .where(eq(sessionsSchema.userId, userId))
      .returning();

    return deletedSessions;
  }
}
