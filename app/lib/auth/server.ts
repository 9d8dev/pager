"use server";

import { auth } from "./";
import { headers } from "next/headers";

export const getSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
};

export const signIn = async (email: string, password: string) => {
  const response = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  return response;
};

export const signUp = async (name: string, email: string, password: string) => {
  const response = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  return response;
};
