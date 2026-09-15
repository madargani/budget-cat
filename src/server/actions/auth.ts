"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "~/server/better-auth";

export async function signIn(data: { email: string; password: string }) {
  await auth.api.signInEmail({
    body: {
      email: data.email,
      password: data.password,
    },
  });
  redirect("/");
}

export async function signUp(data: {
  name: string;
  email: string;
  password: string;
}) {
  await auth.api.signUpEmail({
    body: {
      name: data.name,
      email: data.email,
      password: data.password,
    },
  });
  redirect("/");
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
