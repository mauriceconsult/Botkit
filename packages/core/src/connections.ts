// packages/core/src/connections.ts
import { db } from "@botkit/database";
import { decrypt } from "./crypto";
// import { decrypt } from "./crypto.js"; // the encryption utility from the AccountConnection design

export async function getConnectionToken(
  userId: string,
  provider: string,
): Promise<string> {
  const connection = await db.accountConnection.findUnique({
    where: { userId_provider: { userId, provider } },
  });
  if (!connection?.isActive || !connection.encryptedSecret) {
    throw new Error(
      `No active ${provider} connection for this user. Run \`botkit connect ${provider}\`.`,
    );
  }
  const secret = JSON.parse(decrypt(connection.encryptedSecret));
  // TODO once refresh is wired: check secret.expiresAt, refresh via TOKEN_URL if needed
  return secret.accessToken;
}
