"use client";

import React from "react";
import { usePlaidLink } from "react-plaid-link";
import { api } from "~/trpc/react";

export function PlaidLink() {
  const { data: token } = api.plaid.createLinkToken.useQuery();
  const exchangeMutation = api.plaid.exchangePublicToken.useMutation({
    onSuccess: (data) => {},
    onError: (error) => {
      console.log(error);
    },
  });

  const { open, ready } = usePlaidLink({
    token: token?.link_token || null,
    onSuccess: (public_token, metadata) => {
      if (public_token === null) {
        console.log("public token returned null");
        return;
      }
      exchangeMutation.mutate({ public_token });
    },
  });

  return (
    <button
      className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
      onClick={() => open()}
      disabled={!ready}
    >
      Connect a bank account
    </button>
  );
}
