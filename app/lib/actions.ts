"use server";

import { page } from "pagerdev";

export async function sendNotification() {
  console.log("You clicked the button");
  page("Congrats! You clicked the button.");
}
