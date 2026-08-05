import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

function validateApiBaseUrl(value) {
  const apiBaseUrl = value?.trim();

  if (!apiBaseUrl) {
    throw new Error("Missing required environment variable: VITE_API_BASE_URL");
  }

  let parsedApiBaseUrl;

  try {
    parsedApiBaseUrl = new URL(apiBaseUrl);
  } catch {
    throw new Error("VITE_API_BASE_URL must be a valid absolute URL.");
  }

  if (!["http:", "https:"].includes(parsedApiBaseUrl.protocol)) {
    throw new Error("VITE_API_BASE_URL must use the HTTP or HTTPS protocol.");
  }

  if (parsedApiBaseUrl.username || parsedApiBaseUrl.password) {
    throw new Error("VITE_API_BASE_URL must not contain embedded credentials.");
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const fileEnvironment = loadEnv(mode, process.cwd(), "VITE_");

  validateApiBaseUrl(
    process.env.VITE_API_BASE_URL ?? fileEnvironment.VITE_API_BASE_URL,
  );

  return {
    plugins: [react(), tailwindcss()],
  };
});
