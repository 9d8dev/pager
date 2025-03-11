"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { useAction } from "next-safe-action/hooks";

export function SignOut() {
  const { execute, isExecuting } = useAction(signOut);
  return (
    <Button disabled={isExecuting} onClick={() => execute()}>
      Sign Out
    </Button>
  );
}
