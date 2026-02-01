"use client";

import React from "react";
import dynamic from "next/dynamic";

// Nextjs hydration error fix
const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton,
    ),
  {
    ssr: false,
    
  },
);

export function WalletButton() {
  return (
    <div>
      <WalletMultiButton  />
    </div>
  );
}
