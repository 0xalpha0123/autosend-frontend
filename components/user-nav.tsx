"use client";

import React, { useEffect } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { toast } from "sonner";
import { useChainId, useSwitchChain } from "wagmi";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { shortenAddress } from "@/lib/utils";
import { MODE, ADDRESSES } from "@/lib/constants";

export function UserNav() {
  const { wallets } = useWallets();
  const { authenticated, login, ready, logout, user } = usePrivy();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  const disableLogin = !ready || (ready && authenticated);

  useEffect(() => {
    if (chainId !== ADDRESSES[MODE].chainID)
      switchChain({ chainId: ADDRESSES[MODE].chainID });
  }, [chainId]);

  return (
    <>
      {authenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/01.png" alt="@shadcn" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Address</p>
                <CopyToClipboard
                  text={user && user.wallet ? user.wallet.address : ""}
                  onCopy={() => toast("Wallet address copied to clipboard.")}
                >
                  <p className="text-xs leading-none text-muted-foreground cursor-pointer">
                    {user && user.wallet
                      ? shortenAddress(user.wallet.address)
                      : ""}
                  </p>
                </CopyToClipboard>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button disabled={disableLogin} onClick={login}>
          Login
        </Button>
      )}
    </>
  );
}
