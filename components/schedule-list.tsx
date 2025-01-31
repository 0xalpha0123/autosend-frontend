"use client";

import React, { useEffect, useState } from "react";
// import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useChainId, useReadContract, useSwitchChain } from "wagmi";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { columns } from "@/components/data-table/columns";
import { DataTable } from "@/components/data-table/data-table";

import { taskSchema } from "@/data/schema";

import data from "@/data/tasks.json";
import { ADDRESSES, MODE } from "@/lib/constants";
import autoSendABI from "@/lib/abis/autoSendABI.json";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { formatData } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  createPublicClient,
  encodeFunctionData,
  erc20Abi,
  http,
  parseUnits,
} from "viem";
import { LoadingButton } from "./ui/loading-button";
import { base, sepolia } from "viem/chains";

// Simulate a database read for tasks.
// function getTasks() {
//   const tasks = data;

//   return z.array(taskSchema).parse(tasks);
// }

const initScheduleValue = {
  description: "",
  recipient: "",
  asset: ADDRESSES[MODE].USDC,
  amount: 0,
  interval: "86400",
  expiredTime: "",
};

const client = createPublicClient({
  chain: MODE === "testnet" ? sepolia : base, // Change to your actual blockchain
  transport: http(),
});

export function ScheduleList() {
  // const tasks = getTasks();

  const chainId = useChainId();
  const { user } = usePrivy();
  const { wallets } = useWallets();

  const { switchChain } = useSwitchChain();

  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  // const [errorMessage, setErrorMessage] = useState("");
  const [newSchedule, setNewSchedule] = useState(initScheduleValue);

  useEffect(() => {
    if (chainId !== ADDRESSES[MODE].chainID)
      switchChain({ chainId: ADDRESSES[MODE].chainID });
  }, [chainId]);

  const scheduleList = useReadContract({
    abi: autoSendABI.abi,
    address: ADDRESSES[MODE].AUTOSEND,
    functionName: "getSchedules",
    // args: [],
    account: user?.wallet?.address as `0x${string}`,
  });

  let approvedUSDC = useReadContract({
    abi: erc20Abi,
    address: ADDRESSES[MODE].USDC,
    functionName: "allowance",
    args: [user?.wallet?.address as `0x${string}`, ADDRESSES[MODE].AUTOSEND],
    account: user?.wallet?.address as `0x${string}`,
  });

  const handleModalChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setNewSchedule({ ...newSchedule, [e.target.name]: e.target.value });
  };

  const createSchedule = async () => {
    setIsLoading(true);
    const nonEmbeddedWallets = wallets.filter(
      (wallet) => wallet.connectorType !== "embedded"
    );
    const provider = await nonEmbeddedWallets[0].getEthereumProvider();

    // setErrorMessage("");

    // Convert USDC amount to smallest unit (6 decimal places)
    const amount = parseUnits(
      newSchedule.amount.toString(),
      ADDRESSES[MODE].USDC_DECIMAL
    );

    if (parseInt(approvedUSDC.data as unknown as string) === 0) {
      try {
        const maxUint256 = BigInt(2) ** BigInt(256) - BigInt(1); // Max uint256

        const data = encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [ADDRESSES[MODE].AUTOSEND, maxUint256],
        });
        const transactionRequest = {
          from: nonEmbeddedWallets[0].address,
          to: ADDRESSES[MODE].USDC,
          data: data,
        };
        const transactionHash = await provider.request({
          method: "eth_sendTransaction",
          params: [transactionRequest],
        });

        console.log(
          "Transaction sent, waiting for confirmation...",
          transactionHash
        );

        // Wait for transaction receipt using Viem
        const receipt = await client.waitForTransactionReceipt({
          hash: transactionHash,
        });

        if (receipt.status === "success") {
          console.log("✅ Transaction confirmed:", receipt);
          toast("Approved transaction confirmed!");
        } else {
          console.log("❌ Transaction failed:", receipt);
          toast("Approved transaction failed.");
        }
      } catch (error) {
        console.error("Approved transaction failed:", error);
        toast("Approved transaction failed. Please try again.");
      }
    }
    try {
      const data = encodeFunctionData({
        abi: autoSendABI.abi,
        functionName: "createSchedule",
        args: [
          newSchedule.description,
          newSchedule.asset,
          newSchedule.recipient,
          amount,
          newSchedule.interval,
          newSchedule.expiredTime,
        ],
      });
      const transactionRequest = {
        from: nonEmbeddedWallets[0].address,
        to: ADDRESSES[MODE].AUTOSEND,
        data: data,
      };
      const transactionHash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionRequest],
      });

      console.log(
        "Transaction sent, waiting for confirmation...",
        transactionHash
      );

      // Wait for transaction receipt using Viem
      const receipt = await client.waitForTransactionReceipt({
        hash: transactionHash,
      });

      if (receipt.status === "success") {
        console.log("✅ CreateSchedule Transaction confirmed:", receipt);
        toast("CreateSchedule Transaction confirmed!");
      } else {
        console.log("❌ CreateSchedule Transaction failed:", receipt);
        toast("CreateSchedule Transaction failed.");
      }
    } catch (error) {
      console.error("CreateSchedule Transaction failed:", error);
      toast("CreateSchedule Transaction failed. Please try again.");
    }
    setIsLoading(false);
    setNewSchedule(initScheduleValue);
    setOpenDialog(false);
  };

  return (
    <>
      <div className="w-full flex items-center justify-between space-y-2 flex-col sm:flex-row">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Reoccurring payments
          </h2>
          <p className="text-muted-foreground">
            Set up regularly scheduled USDC sends
          </p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild className="w-full sm:w-auto">
              <Button
                variant="ghost"
                size="icon"
                disabled={isLoading}
                className="p-4"
              >
                <PlusCircle />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full sm:max-w-[425px] space-y-2">
              <DialogHeader className="space-y-1">
                <DialogTitle>Start reoccurring payment</DialogTitle>
                <div className="space-y-0">
                  <DialogDescription>
                    All reoccurring payments are made in USDC.
                  </DialogDescription>
                  <DialogDescription>
                    Autosend charges 0.5% per transaction.
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  name="description"
                  placeholder="Name of the reoccurring payment"
                  onChange={handleModalChange}
                  value={newSchedule.description}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  name="recipient"
                  placeholder="0x..."
                  onChange={handleModalChange}
                  value={newSchedule.recipient}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  name="amount"
                  placeholder="0.00"
                  onChange={handleModalChange}
                  value={newSchedule.amount}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="interval">Payment Schedule</Label>
                <Select
                  name="interval"
                  onValueChange={(value) =>
                    setNewSchedule({ ...newSchedule, interval: value })
                  }
                  value={newSchedule.interval}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment cadence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="86400">Every day</SelectItem>
                    <SelectItem value="604800">Every week</SelectItem>
                    <SelectItem value="1209600">Every 2 weeks</SelectItem>
                    <SelectItem value="1814400">Every 3 weeks</SelectItem>
                    <SelectItem value="2419200">Every 4 weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Popover>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="expiredTime">End date</Label>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !new Date(parseInt(newSchedule.expiredTime) * 1000) &&
                          "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon />
                      {newSchedule.expiredTime ? (
                        format(
                          new Date(parseInt(newSchedule.expiredTime) * 1000),
                          "PPP"
                        )
                      ) : (
                        <span>When to stop payments</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      onSelect={(value: Date | undefined) => {
                        if (!value) return;

                        const timestamp = Math.floor(
                          value.getTime() / 1000
                        ).toString();
                        setNewSchedule({
                          ...newSchedule,
                          expiredTime: timestamp,
                        });
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </div>
              </Popover>
              <DialogFooter>
                <div className="grid w-full items-center gap-1.5">
                  <Label>
                    The first payment gets sent immediately. Before making a
                    transaction, you need to approve USDC for the smart
                    contract.
                  </Label>
                  <LoadingButton
                    className="w-full"
                    onClick={() => {
                      createSchedule();
                    }}
                    loading={isLoading}
                  >
                    Start payment
                  </LoadingButton>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <DataTable
        data={!!scheduleList ? formatData(scheduleList.data) : []}
        columns={columns}
      />
    </>
  );
}
