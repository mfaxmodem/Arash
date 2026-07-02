// Toast wrapper that mimics sonner's API but uses radix toast system
// This avoids sonner/React 19 compatibility issues

import { toast as radixToast } from "@/hooks/use-toast";

interface ToastOptions {
  description?: string;
}

function success(message: string, opts?: ToastOptions) {
  radixToast({
    title: message,
    description: opts?.description,
    variant: "default",
    className: "bg-green-600 text-white border-green-700",
  });
}

function error(message: string, opts?: ToastOptions) {
  radixToast({
    title: message,
    description: opts?.description,
    variant: "destructive",
  });
}

function info(message: string, opts?: ToastOptions) {
  radixToast({
    title: message,
    description: opts?.description,
  });
}

function message(message: string, opts?: ToastOptions) {
  radixToast({
    title: message,
    description: opts?.description,
  });
}

function warning(message: string, opts?: ToastOptions) {
  radixToast({
    title: message,
    description: opts?.description,
    className: "bg-amber-500 text-white border-amber-600",
  });
}

export const toast = { success, error, info, message, warning };
