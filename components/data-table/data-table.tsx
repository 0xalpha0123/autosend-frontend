"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { createPublicClient, encodeFunctionData, http, parseUnits } from "viem";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { ADDRESSES, MODE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import autoSendABI from "@/lib/abis/autoSendABI.json";
import { LoadingButton } from "../ui/loading-button";
import { base, sepolia } from "viem/chains";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

interface Schedule {
  index?: number;
  description: string;
  recipient?: string;
  asset?: `0x${string}`;
  amount: string;
  interval: string;
  expiredTime?: string;
  status: string;
}

const initScheduleValue = {
  index: 0,
  description: "",
  recipient: "",
  asset: ADDRESSES[MODE].USDC,
  amount: "0",
  interval: "86400",
  expiredTime: "",
  status: "0",
};

const client = createPublicClient({
  chain: MODE === "testnet" ? sepolia : base, // Change to your actual blockchain
  transport: http(),
});

export function DataTable<TData extends Schedule, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const { user } = usePrivy();
  const { wallets } = useWallets();

  const [isLoading, setIsLoading] = React.useState(false);
  // const [errorMessage, setErrorMessage] = React.useState("");
  const [rowSelection, setRowSelection] = React.useState({});
  const [openDialog, setOpenDialog] = React.useState(false);
  const [schedule, setSchedule] = React.useState<Schedule>(initScheduleValue);
  const [mode, setMode] = React.useState("edit");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const handleOpenScan = () => {
    window.open(
      ADDRESSES[MODE].ETHSCAN_URL +
        `address/${user?.wallet?.address}#tokentxns`,
      "_blank"
    );
  };

  const handleModalChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setSchedule({ ...schedule, [e.target.name]: e.target.value });
  };

  const updateSchedule = async () => {
    setIsLoading(true);
    const nonEmbeddedWallets = wallets.filter(
      (wallet) => wallet.connectorType !== "embedded"
    );
    const provider = await nonEmbeddedWallets[0].getEthereumProvider();

    // setErrorMessage("");

    // Convert USDC amount to smallest unit (6 decimal places)
    const amount = parseUnits(
      schedule.amount.toString(),
      ADDRESSES[MODE].USDC_DECIMAL
    );

    try {
      const data = encodeFunctionData({
        abi: autoSendABI.abi,
        functionName: "updateSchedule",
        args: [
          schedule.index,
          schedule.description,
          schedule.asset,
          schedule.recipient,
          amount,
          schedule.interval,
          schedule.expiredTime,
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
        console.log("✅ Transaction confirmed:", receipt);
        toast("Transaction confirmed!");
      } else {
        console.log("❌ Transaction failed:", receipt);
        // setErrorMessage("Transaction failed.");
        toast("Transaction failed.");
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      // setErrorMessage("Transaction failed. Please try again.");
      toast("Transaction failed. Please try again.");
    }
    setIsLoading(false);
    setSchedule(initScheduleValue);
    setOpenDialog(false);
  };

  const deleteSchedule = async () => {
    setIsLoading(true);
    const nonEmbeddedWallets = wallets.filter(
      (wallet) => wallet.connectorType !== "embedded"
    );
    const provider = await nonEmbeddedWallets[0].getEthereumProvider();

    // setErrorMessage("");

    try {
      const data = encodeFunctionData({
        abi: autoSendABI.abi,
        functionName: "cancelSchedule",
        args: [schedule.index],
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
        console.log("✅ Transaction confirmed:", receipt);
        toast("Transaction confirmed!");
      } else {
        console.log("❌ Transaction failed:", receipt);
        // setErrorMessage("Transaction failed.");
        toast("Transaction failed.");
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      // setErrorMessage("Transaction failed. Please try again.");
      toast("Transaction failed. Please try again.");
    }
    setIsLoading(false);
    setSchedule(initScheduleValue);
    setOpenDialog(false);
  };

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Dialog
                  key={row.id}
                  open={openDialog}
                  onOpenChange={setOpenDialog}
                >
                  <DialogTrigger
                    onClick={() => {
                      setMode("detail");
                      setSchedule(row.original);
                      setOpenDialog(true);

                      console.log(schedule);
                    }}
                    asChild
                    className="w-full sm:w-auto"
                  >
                    <TableRow
                      key={row.id}
                      className="cursor-pointer"
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </DialogTrigger>
                  <DialogContent className="w-full sm:max-w-[425px] space-y-2">
                    <DialogHeader className="space-y-1">
                      <DialogTitle>Payment Details</DialogTitle>
                    </DialogHeader>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        name="description"
                        placeholder="Name of the reoccurring payment"
                        onChange={handleModalChange}
                        value={schedule.description}
                        disabled={mode === "detail"}
                      />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="recipient">Recipient Address</Label>
                      <Input
                        name="recipient"
                        placeholder="0x..."
                        onChange={handleModalChange}
                        value={schedule.recipient}
                        disabled={mode === "detail"}
                      />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        name="amount"
                        placeholder="0.00"
                        onChange={handleModalChange}
                        value={schedule.amount}
                        disabled={mode === "detail"}
                      />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="interval">Payment Schedule</Label>
                      <Select
                        name="interval"
                        onValueChange={(value) =>
                          setSchedule({
                            ...schedule,
                            interval: value,
                          })
                        }
                        value={schedule.interval}
                        disabled={mode === "detail"}
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
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="expiredTime">End date</Label>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !new Date(
                                parseInt(schedule.expiredTime!) * 1000
                              ) && "text-muted-foreground"
                            )}
                            disabled={mode === "detail"}
                          >
                            <CalendarIcon />
                            {schedule.expiredTime ? (
                              format(
                                new Date(parseInt(schedule.expiredTime) * 1000),
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
                              setSchedule({
                                ...schedule,
                                expiredTime: timestamp,
                              });
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </div>
                    </Popover>
                    <DialogFooter>
                      <div className="w-full flex-col space-y-2">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          {mode === "detail" && (
                            <Button
                              type="submit"
                              className="w-full"
                              onClick={() => setMode("edit")}
                            >
                              Edit Payment
                            </Button>
                          )}
                          {mode === "edit" && (
                            <LoadingButton
                              className="w-full"
                              onClick={() => {
                                updateSchedule();
                              }}
                              loading={isLoading}
                            >
                              Confirm Changes
                            </LoadingButton>
                          )}
                        </div>
                        {mode === "detail" && (
                          <div className="w-full flex max-w-sm items-center gap-1.5">
                            <Button
                              variant="outline"
                              className="w-[50%]"
                              onClick={handleOpenScan}
                            >
                              View Transactions
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-[50%] text-red-500"
                                >
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you absolutely sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete this reoccurring payment.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <LoadingButton
                                    className="text-red-500 h-9"
                                    onClick={() => {
                                      deleteSchedule();
                                    }}
                                    variant="outline"
                                    loading={isLoading}
                                  >
                                    Yes, delete it
                                  </LoadingButton>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
