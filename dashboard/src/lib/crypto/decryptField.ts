import CryptoJS from "crypto-js";

type BackendEncryptedPayload = {
  iv_b64: string;
  tag_b64: string;
  data_b64: string;
};

function base64ToUtf8(b64: string): string {
  // Backend stores: base64(JSON.stringify({iv_b64, tag_b64, data_b64}))
  return CryptoJS.enc.Base64.parse(b64).toString(CryptoJS.enc.Utf8);
}

function base64ToBytes(b64: string): Uint8Array {
  const wordArray = CryptoJS.enc.Base64.parse(b64);
  const words = wordArray.words;
  const sigBytes = wordArray.sigBytes;

  const bytes = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i++) {
    const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    bytes[i] = byte;
  }
  return bytes;
}

function getKeyBytes(): Uint8Array {
  const keyB64 = process.env.NEXT_PUBLIC_MEDICAL_RECORD_ENC_KEY_B64;
  if (!keyB64) {
    throw new Error(
      "Missing NEXT_PUBLIC_MEDICAL_RECORD_ENC_KEY_B64 (set it in .env.local)"
    );
  }
  return base64ToBytes(keyB64);
}

async function decryptAes256GcmBackendPayload(
  encryptedOuterB64: string
): Promise<string> {
  const payloadJson = base64ToUtf8(encryptedOuterB64);
  const payload = JSON.parse(payloadJson) as BackendEncryptedPayload;
  if (!payload.iv_b64 || !payload.tag_b64 || !payload.data_b64) {
    throw new Error("Not an AES-GCM payload");
  }

  const keyBytes = getKeyBytes();
  const iv = base64ToBytes(payload.iv_b64) as Uint8Array<ArrayBuffer>;
  const tag = base64ToBytes(payload.tag_b64) as Uint8Array<ArrayBuffer>;
  const data = base64ToBytes(payload.data_b64) as Uint8Array<ArrayBuffer>;

  // WebCrypto expects ciphertext||tag (tag is appended to ciphertext).
  const combined = new Uint8Array(data.length + tag.length);
  combined.set(data, 0);
  combined.set(tag, data.length);

  const keyData = keyBytes.buffer.slice(
    keyBytes.byteOffset,
    keyBytes.byteOffset + keyBytes.byteLength
  ) as ArrayBuffer;

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    key,
    combined
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Decrypts a backend `encryptField()` value when it looks like an encrypted payload.
 * If the input is already plaintext, it is returned as-is.
 */
export async function decryptIfEncrypted(
  value: string | null | undefined
): Promise<string | null> {
  if (value == null) return null;
  if (value.length < 20) return value;

  try {
    const json = base64ToUtf8(value);
    const maybe = JSON.parse(json) as Partial<BackendEncryptedPayload>;
    if (maybe.iv_b64 && maybe.tag_b64 && maybe.data_b64) {
      return await decryptAes256GcmBackendPayload(value);
    }
    return value;
  } catch {
    return value;
  }
}

