export type ThemeOption = {
  id: string;
  label: string;
  description: string;
  swatches: string[];
};

export const themeOptions: ThemeOption[] = [
  {
    id: "sand",
    label: "Sandstone",
    description: "Warm, editorial, calm",
    swatches: ["#f8f2e9", "#e9734f", "#2f6b73", "#1f1b16"],
  },
  {
    id: "ocean",
    label: "Oceanic",
    description: "Clean, coastal, bright",
    swatches: ["#eef6f9", "#1d7aa6", "#0f5f6a", "#0f1c2e"],
  },
  {
    id: "midnight",
    label: "Midnight",
    description: "Dark, bold, modern",
    swatches: ["#0f1218", "#9b5cff", "#4fd1c5", "#f5f7fb"],
  },
  {
    id: "citrus",
    label: "Citrus",
    description: "Playful, energetic",
    swatches: ["#fff7ed", "#ff7a18", "#2f7d5c", "#2a1b12"],
  },
];

export function resolveTheme(value?: string) {
  const match = themeOptions.find((theme) => theme.id === value);
  return match?.id ?? "sand";
}
