import { db } from "@/lib/db";
import { pager } from "@/lib/db/schema";
import { randomBytes } from "crypto";
import { getSession } from "@/lib/auth/server";
import { eq } from "drizzle-orm";

export const createPager = async (userId: string) => {
  await db.insert(pager).values({
    userId,
    token: randomBytes(32).toString("hex"),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const getPager = async () => {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const pagerInfo = await db
    .select()
    .from(pager)
    .where(eq(pager.userId, session.user.id))
    .limit(1);

  return pagerInfo[0];
};
