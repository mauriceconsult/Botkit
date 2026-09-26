import { db } from "@botkit/database";
import { encrypt, decrypt } from "./crypto.js";

export async function saveConnection(
  userId: string,
  provider: string,
  kind: "ai_byok" | "ai_routed" | "product_oauth",
  secret: unknown,
) {
  const encryptedSecret = encrypt(JSON.stringify(secret));
  await db.accountConnection.upsert({
    where: { userId_provider: { userId, provider: provider as any } },
    create: {
      userId,
      provider: provider as any,
      kind: kind as any,
      encryptedSecret,
      isActive: true,
    },
    update: { kind: kind as any, encryptedSecret, isActive: true },
  });
}

export async function getConnectionToken(
  userId: string,
  provider: string,
): Promise<string> {
  const connection = await db.accountConnection.findUnique({
    where: { userId_provider: { userId, provider: provider as any } },
  });
  if (!connection?.isActive || !connection.encryptedSecret) {
    throw new Error(
      `No active ${provider} connection for this user. Run \`botkit connect ${provider}\`.`,
    );
  }
  const secret = JSON.parse(decrypt(connection.encryptedSecret));
  return secret.accessToken;
}
