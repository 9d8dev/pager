"use server";

import { redirect } from "next/navigation";
import { auth } from "./";
import { headers, cookies } from "next/headers";

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

export const signOut = async () => {
  const allCookies = await cookies();
  allCookies.delete("better-auth.session_token");
  allCookies.delete("better-auth.session_data");
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
