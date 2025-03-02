import { defineConfig } from "vite";
import { redwood } from "@redwoodjs/sdk/vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [redwood(), tailwindcss()],
});
