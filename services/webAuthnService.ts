// services/webAuthnService.ts
// Biometric Authentication (WebAuthn / Passkeys / Fingerprint / FaceID) Service

import { getAbsoluteApiUrl } from './apiConfig';

export function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function base64UrlToBuffer(base64Url: string): ArrayBuffer {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export interface WebAuthnSupportStatus {
  isSupported: boolean;
  isPlatformAvailable: boolean;
}

export async function checkWebAuthnSupport(): Promise<WebAuthnSupportStatus> {
  const isSupported = typeof window !== 'undefined' && 
                      !!window.PublicKeyCredential && 
                      typeof window.PublicKeyCredential === 'function';

  let isPlatformAvailable = false;
  if (isSupported && window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
    try {
      isPlatformAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      isPlatformAvailable = false;
    }
  }

  return { isSupported, isPlatformAvailable };
}

/**
 * Registers a new hardware-backed Biometric (Passkey / Fingerprint / FaceID) credential for a user.
 */
export async function registerBiometricCredential(email: string, name: string): Promise<{ success: boolean; credentialId?: string; message?: string }> {
  try {
    const support = await checkWebAuthnSupport();
    if (!support.isSupported) {
      throw new Error("Sizning brauzeringiz biometrik (WebAuthn / Passkey) xavfsizlikni qo'llab-quvvatlamaydi.");
    }

    // 1. Get registration options from backend server
    const optRes = await fetch(getAbsoluteApiUrl('/api/webauthn/register-options'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });

    if (!optRes.ok) {
      const err = await optRes.json();
      throw new Error(err.error || "Serverdan biometrik parametrlarni olishda xatolik");
    }

    const options = await optRes.json();

    // 2. Format options for browser navigator.credentials.create API
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge: base64UrlToBuffer(options.challenge),
      rp: options.rp,
      user: {
        id: new TextEncoder().encode(options.user.id),
        name: options.user.name,
        displayName: options.user.displayName
      },
      pubKeyCredParams: options.pubKeyCredParams || [
        { alg: -7, type: 'public-key' },  // ES256
        { alg: -257, type: 'public-key' } // RS256
      ],
      authenticatorSelection: options.authenticatorSelection || {
        authenticatorAttachment: 'platform', // Hardware device TouchID/FaceID/Fingerprint/Windows Hello
        userVerification: 'preferred',
        requireResidentKey: false
      },
      timeout: 60000,
      attestation: 'none'
    };

    // 3. Request browser hardware biometric prompt
    let credential: PublicKeyCredential | null = null;
    try {
      credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;
    } catch (createErr: any) {
      if (createErr.name === 'NotAllowedError') {
        throw new Error("Biometrik tasdiqlash rad etildi yoki vaqti tugadi.");
      } else if (createErr.name === 'InvalidStateError') {
        throw new Error("Ushbu biometrik kalit ushbu qurilmada allaqachon ro'yxatdan o'tgan.");
      } else {
        // Fallback or explicit security message
        throw new Error("Biometrik qurilma skanerida xatolik: " + (createErr.message || createErr.name));
      }
    }

    if (!credential) {
      throw new Error("Biometrik kalit yaratilmadi.");
    }

    const attestationResponse = credential.response as AuthenticatorAttestationResponse;

    const payload = {
      email,
      credential: {
        id: credential.id,
        rawId: bufferToBase64Url(credential.rawId),
        clientDataJSON: bufferToBase64Url(attestationResponse.clientDataJSON),
        attestationObject: bufferToBase64Url(attestationResponse.attestationObject)
      }
    };

    // 4. Verify & save credential on backend server
    const verifyRes = await fetch(getAbsoluteApiUrl('/api/webauthn/register-verify'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!verifyRes.ok) {
      const err = await verifyRes.json();
      throw new Error(err.error || "Biometrik kalitni serverda saqlashda xatolik");
    }

    const verifyData = await verifyRes.json();
    return { success: true, credentialId: credential.id, message: verifyData.message };
  } catch (error: any) {
    console.error("[WebAuthn Registration Error]:", error);
    return { success: false, message: error.message || "Biometrik kalit biriktirishda xatolik" };
  }
}

/**
 * Authenticates user via hardware-backed Biometrics (Fingerprint / FaceID / TouchID / Passkey).
 */
export async function authenticateWithBiometrics(userEmail?: string): Promise<{ success: boolean; user?: any; message?: string }> {
  try {
    const support = await checkWebAuthnSupport();
    if (!support.isSupported) {
      throw new Error("Sizning brauzeringiz biometrik (WebAuthn / Passkey) xavfsizlikni qo'llab-quvvatlamaydi.");
    }

    // 1. Get login challenge options from backend server
    const optRes = await fetch(getAbsoluteApiUrl('/api/webauthn/login-options'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail || '' })
    });

    if (!optRes.ok) {
      const err = await optRes.json();
      throw new Error(err.error || "Biometrik kirish sozlamalarini olishda xatolik");
    }

    const options = await optRes.json();

    if (!options.allowCredentials || options.allowCredentials.length === 0) {
      throw new Error("Ushbu akkaunt (yoki qurilma) uchun birorta ham biometrik kalit ro'yxatdan o'tmagan. Avval parolingiz bilan kirib, Sozlamalardan biometrik kalit biriktiring.");
    }

    // 2. Convert options for navigator.credentials.get
    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge: base64UrlToBuffer(options.challenge),
      allowCredentials: options.allowCredentials.map((cred: any) => ({
        id: base64UrlToBuffer(cred.id),
        type: 'public-key'
      })),
      userVerification: 'preferred',
      timeout: 60000
    };

    // 3. Trigger hardware biometric scanner (Fingerprint/FaceID/TouchID prompt)
    let assertion: PublicKeyCredential | null = null;
    try {
      assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential;
    } catch (getErr: any) {
      if (getErr.name === 'NotAllowedError') {
        throw new Error("Biometrik autentifikatsiya bekor qilindi.");
      } else {
        throw new Error("Biometrik skanerlashda xatolik: " + (getErr.message || getErr.name));
      }
    }

    if (!assertion) {
      throw new Error("Biometrik tasdiqlash amalga oshmadi.");
    }

    const assertionResponse = assertion.response as AuthenticatorAssertionResponse;

    const payload = {
      email: userEmail || '',
      credential: {
        id: assertion.id,
        rawId: bufferToBase64Url(assertion.rawId),
        clientDataJSON: bufferToBase64Url(assertionResponse.clientDataJSON),
        authenticatorData: bufferToBase64Url(assertionResponse.authenticatorData),
        signature: bufferToBase64Url(assertionResponse.signature),
        userHandle: assertionResponse.userHandle ? bufferToBase64Url(assertionResponse.userHandle) : null
      }
    };

    // 4. Verify assertion on backend server
    const verifyRes = await fetch(getAbsoluteApiUrl('/api/webauthn/login-verify'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!verifyRes.ok) {
      const err = await verifyRes.json();
      throw new Error(err.error || "Biometrik kalit server tomonidan tasdiqlanmadi.");
    }

    const data = await verifyRes.json();
    return { success: true, user: data.user, message: "Biometrik autentifikatsiya muvaffaqiyatli o'tdi!" };
  } catch (error: any) {
    console.error("[WebAuthn Authentication Error]:", error);
    return { success: false, message: error.message || "Biometrik kirishda xatolik" };
  }
}

/**
 * Checks list of registered biometric keys for a user.
 */
export async function getUserBiometricKeys(email: string): Promise<any[]> {
  try {
    const res = await fetch(getAbsoluteApiUrl(`/api/webauthn/user-credentials?email=${encodeURIComponent(email)}`));
    if (res.ok) {
      const data = await res.json();
      return data.credentials || [];
    }
  } catch (err) {
    console.error("Error fetching biometric keys:", err);
  }
  return [];
}

/**
 * Deletes a registered biometric key for a user.
 */
export async function deleteBiometricKey(email: string, credentialId: string): Promise<boolean> {
  try {
    const res = await fetch(getAbsoluteApiUrl('/api/webauthn/delete-credential'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, credentialId })
    });
    return res.ok;
  } catch (err) {
    console.error("Error deleting biometric key:", err);
    return false;
  }
}
