import { eq } from "drizzle-orm";
import { db, redis } from "../../db/db.ts";
import { usersTable, userStatTable } from "../../db/schema.ts";

export async function getUserByPassKey(passKey: string) {
  const subQuery = db
    .select({ userId: userStatTable.user_id })
    .from(userStatTable)
    .where(eq(userStatTable.passKey, passKey))
    .limit(1);
  const [result] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, subQuery));
  if (!result) {
    throw new Error("unauthorized access");
  }
  return result;
}
