import { invoke } from "@tauri-apps/api/core";

export function ec(arguments_: (string | number)[]): Promise<string> {
  return invoke<string>("execute_checked", { program: "ectool", arguments: arguments_.map(String) });
}

export function parseBrightness(output: string): number {
  if (/^\s*Keyboard backlight disabled\.?\s*$/i.test(output)) return 0;
  const match = output.match(/(?:Current\s+keyboard\s+backlight\s+percent\s*:\s*|brightness\s*:\s*)(\d+(?:\.\d+)?)\s*%?/i);
  const value = match ? Number(match[1]) : NaN;
  if (!Number.isFinite(value) || value < 0 || value > 100) throw new Error("Invalid keyboard brightness response");
  return Math.round(value);
}

export function zoomScale(value: unknown): number {
  const percentage = Number(value);
  return Number.isFinite(percentage) && percentage >= 50 && percentage <= 200 ? percentage / 100 : 1;
}
