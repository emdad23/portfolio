// Create an admin user, or reset an existing one's password.
//
//   npm run admin:create -- you@example.com
//
// The password is prompted for with input hidden (so it stays out of shell
// history), or taken from ADMIN_PASSWORD when set, for scripted use.
import { createInterface } from "node:readline";
import bcrypt from "bcryptjs";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const MIN_PASSWORD_LENGTH = 10;
const BCRYPT_ROUNDS = 12;

function ask(question: string, hidden = false): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
  if (hidden && process.stdin.isTTY) {
    // Print the question, swallow the echoed keystrokes.
    const internal = rl as unknown as { _writeToOutput: (s: string) => void };
    let asked = false;
    internal._writeToOutput = (s) => {
      if (!asked) {
        process.stdout.write(s);
        asked = true;
      }
    };
  }
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      if (hidden && process.stdin.isTTY) process.stdout.write("\n");
      resolve(answer);
    }),
  );
}

async function main() {
  const email = (process.argv[2] ?? (await ask("Admin email: "))).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(`"${email}" is not a valid email address`);
  }

  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    password = await ask("Password: ", true);
    if (process.stdin.isTTY && (await ask("Confirm password: ", true)) !== password) {
      throw new Error("Passwords do not match");
    }
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  try {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const existing = await prisma.adminUser.findUnique({ where: { email }, select: { id: true } });
    await prisma.adminUser.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, passwordHash },
    });
    console.log(existing ? `✅ Password reset for ${email}` : `✅ Created admin ${email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(`❌ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
