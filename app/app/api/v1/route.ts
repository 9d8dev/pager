import { headers } from "next/headers";
import { db } from "@/lib/db";
import { pager, page } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { pageSchema } from "@/lib/data/validations";

export async function POST(request: Request) {
  const headersList = await headers();
  const authorization = headersList.get("Authorization");

  // metadata
  const referer = headersList.get("Referer");
  const origin = headersList.get("Origin");
  const host = headersList.get("Host");
  const userAgent = headersList.get("User-Agent");
  const ipAddress = headersList.get("X-Forwarded-For");

  // for (const [key, value] of headersList.entries()) {
  //   console.log(`${key}: ${value}`);
  // }

  if (!authorization) {
    return Response.json(
      { status: "error", message: "Unauthorized" },
      { status: 401 }
    );
  }

  const token = authorization.split(" ")[1];

  const foundPager = await db
    .select()
    .from(pager)
    .where(eq(pager.token, token))
    .limit(1);

  if (foundPager.length === 0) {
    return Response.json(
      { status: "error", message: "Unauthorized" },
      { status: 401 }
    );
  }

  const selectedPager = foundPager[0];

  const body = await request.json();

  const validatedBody = pageSchema.safeParse(body);
  if (!validatedBody.success) {
    return Response.json(
      { status: "error", message: validatedBody.error.errors },
      { status: 400 }
    );
  }

  const data = validatedBody.data;

  // SEND TO UPSTASH

  await db.insert(page).values({
    pagerId: selectedPager.id,
    message: data.message,
    notif: data.notif ?? true,
    discord: data.discord ?? null,
    email: data.email ?? null,
    slack: data.slack ?? null,
    webhook: data.webhook ?? null,
    ipAddress: ipAddress ?? null,
    userAgent: userAgent ?? null,
    referer: referer ?? null,
    origin: origin ?? null,
    host: host ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return Response.json({
    status: "success",
    message: `paged at ${new Date().toISOString()}`,
  });
}
