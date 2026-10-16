"use client";

import React from "react";
import { usePlaidLink } from "react-plaid-link";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export function PlaidLink() {
  const { data: token } = api.items.createLinkToken.useQuery();
  const exchangeMutation = api.items.exchangePublicToken.useMutation({
    onError: (error) => {
      console.log(error);
    },
  });

  const { open, ready } = usePlaidLink({
    token: token?.link_token ?? null,
    onSuccess: (public_token) => {
      if (public_token === null) {
        console.log("public token returned null");
        return;
      }
      exchangeMutation.mutate({ public_token });
    },
  });

  return (
    <Button
      className="w-full"
      onClick={() => open()}
      disabled={!ready}
    >
      Connect a bank account
    </Button>
  );
}
