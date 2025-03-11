"use server";

import { z } from "zod";
import { actionClient } from "@/lib/data/safe";
import { signIn as signInFunc, signUp as signUpFunc } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { signInSchema, signUpSchema } from "@/lib/data/validations";

export const signIn = actionClient
  .schema(signInSchema)
  .action(async ({ parsedInput }) => {
    const { email, password } = parsedInput;
    await signInFunc(email, password);
    redirect("/dashboard");
  });

export const signUp = actionClient
  .schema(signUpSchema)
  .action(async ({ parsedInput }) => {
    const { name, email, password } = parsedInput;
    await signUpFunc(name, email, password);
    redirect("/dashboard");
  });
