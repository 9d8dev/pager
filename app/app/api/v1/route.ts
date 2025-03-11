import { headers } from "next/headers";

export async function POST(request: Request) {
  const headersList = await headers();
  const authorization = headersList.get("authorization");

  if (!authorization) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // await upstash(); --> send to upstash
  //  api to slack
  //  api to discord
  //  api to webhook
  //  api to email

  return Response.json({ message: "pager.dev v1 api" });
}
