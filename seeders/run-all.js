/**
 * Ejecuta todos los seeders (usuarios, ubicaciones, categorías).
 * Si la BD no está disponible, avisa y sale con código 0
 * para no romper `npm install` (postinstall).
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const SEEDERS = [
  "usuarios.seed.js",
  "ubicaciones.seed.js",
  "categorias.seed.js",
];

function runSeeder(file) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, file)], {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${file} salió con código ${code}`));
    });
  });
}

async function main() {
  console.log("🌱 Ejecutando seeders…");
  try {
    for (const file of SEEDERS) {
      await runSeeder(file);
    }
    console.log("✅ Todos los seeders completados.");
  } catch (err) {
    console.warn(
      "⚠️  Seeders omitidos o incompletos (¿PostgreSQL en marcha y script SQL aplicado?).",
      err.message || err
    );
    if (process.env.SEED_STRICT === "1") {
      process.exit(1);
    }
  }
}

main();
