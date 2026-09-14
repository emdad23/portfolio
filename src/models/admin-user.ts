// AdminUser model: every query against the AdminUser table goes through here.
// Accounts are created by `npm run admin:create`, never by the app.
import { prisma } from "@/lib/prisma";

export function findAdminByEmail(email: string) {
  return prisma.adminUser.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, email: true, passwordHash: true },
  });
}

export function findAdminById(id: string) {
  return prisma.adminUser.findUnique({ where: { id }, select: { id: true, email: true, updatedAt: true } });
}
