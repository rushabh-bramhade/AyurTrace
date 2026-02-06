export async function generateHash(data: Record<string, unknown>): Promise<string> {
  const sortedKeys = Object.keys(data).sort();
  const canonical: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    canonical[key] = data[key];
  }
  const jsonString = JSON.stringify(canonical);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyIntegrity(
  data: Record<string, unknown>,
  storedHash: string
): Promise<boolean> {
  const currentHash = await generateHash(data);
  return currentHash === storedHash;
}

export function truncateHash(hash: string, length = 16): string {
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
}
