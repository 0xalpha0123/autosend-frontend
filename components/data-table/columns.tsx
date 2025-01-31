"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";

import { statuses } from "../../data/data";
import { Task } from "../../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { formatDuration } from "@/lib/utils";

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="w-[100px] sm:w-auto sm:max-w-[400px]"
        column={column}
        title="Description"
      />
    ),
    cell: ({ row }) => (
      <div className="truncate w-[100px] sm:w-auto sm:max-w-[400px]">
        {row.getValue("description")}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader
        className=" w-[50px] sm:w-auto"
        column={column}
        title="Amount"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2 w-[50px] sm:w-auto">
          <span className="truncate font-medium">{row.getValue("amount")}</span>
          <span className="truncate font-medium hidden sm:flex">USDC</span>
        </div>
      );
    },
  },
  {
    accessorKey: "interval",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Interval"
        className="hidden sm:flex"
      />
    ),
    cell: ({ row }) => (
      <div className="hidden sm:flex">
        {"Every " + formatDuration(parseInt(row.getValue("interval")))}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      );

      if (!status) {
        return null;
      }

      return (
        <div className="flex items-center">
          <Badge
            variant={
              status.label === "Scheduled"
                ? "default"
                : status.label === "Canceled"
                ? "destructive"
                : "secondary"
            }
          >
            {status.icon && (
              <status.icon className="hidden sm:flex mr-2 h-4 w-4 text-muted-foreground" />
            )}
            <span>{status.label}</span>
          </Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
];
