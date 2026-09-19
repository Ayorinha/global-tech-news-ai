import { createHash, verify } from "node:crypto";

export function packageDigest(payload) {
  return createHash("sha256").update(typeof payload === "string" ? payload : JSON.stringify(payload)).digest("hex");
}

export function verifyIntelligencePackage({ payload, signature, publicKey, algorithm = "RSA-SHA256" }) {
  if (!signature || !publicKey) return { valid: false, reason: "Missing signature or public key." };
  const ok = verify(algorithm, Buffer.from(typeof payload === "string" ? payload : JSON.stringify(payload)), publicKey, Buffer.from(signature, "base64"));
  return { valid: ok, digest: packageDigest(payload), algorithm };
}
