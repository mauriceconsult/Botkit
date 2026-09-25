import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const keyMaterial =
  process.env.BOTKIT_ENCRYPTION_KEY ?? "botkit-dev-32-byte-secret-key-123";
const encryptionKey = Buffer.from(
  keyMaterial.padEnd(32, "0").slice(0, 32),
  "utf8",
);

export function encrypt(value: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", encryptionKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(value: string): string {
  const [ivHex, encryptedHex] = value.split(":");
  if (!ivHex || !encryptedHex) {
    throw new Error("Invalid encrypted payload");
  }

  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = createDecipheriv("aes-256-cbc", encryptionKey, iv);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8",
  );
}
