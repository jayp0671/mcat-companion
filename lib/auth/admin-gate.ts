import { env } from "@/lib/config";
export function assertAdminPassword(password?: string) {
  if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) throw new Error("Unauthorized admin request");
}
