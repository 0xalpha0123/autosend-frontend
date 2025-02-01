import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ADDRESSES, MODE, Status } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const shortenAddress = (address: string) => {
  return address.slice(0, 15) + "..." + address.slice(-10);
};

export const formatData = (data: any) => {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  if (data === undefined || data === null || data.length === 0) return [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].processed) continue;
    data[i].index = i;
    data[i].processed = true;
    data[i].amount = bigintToStringWithDecimal(
      data[i].amount,
      ADDRESSES[MODE].USDC_DECIMAL
    );
    // data[i].expiredTime = formatUnixTimestamp(
    //   parseInt(data[i].expiredTime.toString())
    // );
    data[i].expiredTime = data[i].expiredTime.toString();
    // data[i].interval =
    //   "Every " + formatDuration(parseInt(data[i].interval.toString()));
    data[i].interval = data[i].interval.toString();
    // "Every " + formatDuration(parseInt(data[i].interval.toString()));
    data[i].lastExecutedTime = data[i].lastExecutedTime.toString();
    data[i].status = Status[data[i].state];
  }
  return data;
};

export const toUnixTimestamp = (date: Date) => {
  return Math.floor(date.getTime() / 1000);
};

export const formatUnixTimestamp = (timestamp: number) => {
  return new Date(timestamp * 1000);
  // return date.toISOString().replace("T", " ").slice(0, 19); // "YYYY-MM-DD HH:MM:SS"
};

function bigintToStringWithDecimal(bigIntValue: bigint, decimalPlaces = 6) {
  const bigIntStr = bigIntValue.toString();

  // If the value is smaller than the decimal places, prepend zeros
  if (bigIntStr.length <= decimalPlaces) {
    return "0." + bigIntStr.padEnd(decimalPlaces, "0");
  } else {
    // Split integer and decimal parts
    const integerPart = bigIntStr.slice(0, -decimalPlaces);
    const decimalPart = bigIntStr.slice(-2);

    return integerPart + "." + decimalPart;
  }
}

export function formatDuration(seconds: number): string {
  const months = Math.floor(seconds / (30 * 24 * 60 * 60)); // Approximate month
  seconds %= 30 * 24 * 60 * 60;

  const weeks = Math.floor(seconds / (7 * 24 * 60 * 60));
  seconds %= 7 * 24 * 60 * 60;

  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds %= 24 * 60 * 60;

  const hours = Math.floor(seconds / (60 * 60));
  seconds %= 60 * 60;

  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  const timeParts = [];

  if (months) timeParts.push(`${months} month${months > 1 ? "s" : ""}`);
  if (weeks) timeParts.push(`${weeks} week${weeks > 1 ? "s" : ""}`);
  if (days) timeParts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) timeParts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes) timeParts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  if (seconds) timeParts.push(`${seconds} second${seconds > 1 ? "s" : ""}`);

  return timeParts.length ? timeParts.join(", ") : "0 seconds";
}
