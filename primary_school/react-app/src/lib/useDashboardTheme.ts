import { useEffect, useState } from "react";

export type DashboardTheme = "light" | "dark";

const isTheme = (value: string | null): value is DashboardTheme =>
  value === "light" || value === "dark";

export const useDashboardTheme = (
  storageKey = "school-dashboard-theme",
) => {
  const [theme, setTheme] = useState<DashboardTheme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const savedTheme = window.localStorage.getItem(storageKey);
    return isTheme(savedTheme) ? savedTheme : "light";
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, theme);
  }, [storageKey, theme]);

  return {
    theme,
    toggleTheme: () =>
      setTheme((currentTheme) =>
        currentTheme === "dark" ? "light" : "dark",
      ),
  };
};
