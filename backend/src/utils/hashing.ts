function base64Encode(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  function base64Decode(b64: string): Uint8Array {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  
  export async function hashPassword(password: string, salt?: Uint8Array): Promise<string> {
    const encoder = new TextEncoder();
    const pwBuffer = encoder.encode(password);
    salt = salt || crypto.getRandomValues(new Uint8Array(16));
  
    const key = await crypto.subtle.importKey(
      "raw",
      pwBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
  
    const derived = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100_000,
        hash: "SHA-256"
      },
      key,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  
    const rawKey = new Uint8Array(await crypto.subtle.exportKey("raw", derived));
  
    const saltB64 = base64Encode(salt);
    const hashB64 = base64Encode(rawKey);
  
    return `${saltB64}:${hashB64}`;
  }
  
  export async function verifyPassword(password: string, stored: string): Promise<boolean> {
    const [saltB64, hashB64] = stored.split(":");
  
    const salt = base64Decode(saltB64);
    const expectedHash = base64Decode(hashB64);
  
    const reHashed = await hashPassword(password, salt);
    const [, reHashB64] = reHashed.split(":");
    const actualHash = base64Decode(reHashB64);
  
    // Constant-time comparison
    if (actualHash.length !== expectedHash.length) return false;
    let isMatch = true;
    for (let i = 0; i < expectedHash.length; i++) {
      if (expectedHash[i] !== actualHash[i]) {
        isMatch = false;
      }
    }
    return isMatch;
  }
  