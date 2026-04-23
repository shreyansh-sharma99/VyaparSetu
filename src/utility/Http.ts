import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import CryptoJS from 'crypto-js';

const IS_ENCRYPTION = import.meta.env.VITE_IS_ENCRYPTION === 'true';
const HEX_KEY = import.meta.env.VITE_ENCRYPTION_KEY || '';

if (IS_ENCRYPTION && (!HEX_KEY || HEX_KEY.length !== 64)) {
  console.warn(
    '[ApiClient] Encryption is enabled, but VITE_ENCRYPTION_KEY is missing or invalid. ' +
    'Set VITE_ENCRYPTION_KEY to a 64 hex char string.'
  );
}

const KEY = HEX_KEY && HEX_KEY.length === 64 ? CryptoJS.enc.Hex.parse(HEX_KEY) : null;

// ─── Core encrypt / decrypt ───────────────────────────────────────────────────

/**
 * Encrypt any JS value → "<iv_hex>:<ciphertext_base64>"
 */
const _encrypt = (payload: any): string => {
  if (!KEY) throw new Error('Cannot encrypt: Key is missing.');
  
  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), KEY, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return `${iv.toString(CryptoJS.enc.Hex)}:${encrypted.ciphertext.toString(CryptoJS.enc.Base64)}`;
};

/**
 * Decrypt "<iv_hex>:<ciphertext_base64>" → original JS value
 */
const _decrypt = (encryptedString: string): any => {
  if (!KEY) throw new Error('Cannot decrypt: Key is missing.');

  const [ivHex, ciphertextBase64] = encryptedString.split(':');

  const iv = CryptoJS.enc.Hex.parse(ivHex);
  const ciphertext = CryptoJS.enc.Base64.parse(ciphertextBase64);

  const decrypted = CryptoJS.AES.decrypt({ ciphertext } as any, KEY, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
};

/**
 * Unwrap a response data field if it is encrypted.
 */
export const parseResponse = (responseData: any): any => {
  if (responseData?.isEncrypted && responseData?.encryptedPayload) {
    return _decrypt(responseData.encryptedPayload);
  }
  return responseData;
};

// ─── Axios Instance Setup ─────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Request Interceptor: Attach token & Encrypt body
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (
      IS_ENCRYPTION &&
      config.data &&
      typeof config.data === 'object' &&
      Object.keys(config.data).length > 0
    ) {
      config.data = { encryptedPayload: _encrypt(config.data) };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Decrypt body & Handle Refresh Token
apiClient.interceptors.response.use(
  (response) => {
    if (response.data?.data) {
      response.data.data = parseResponse(response.data.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 Unauthorized (Token Expiry)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post('/owner/auth/refresh');
        const newToken = data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        apiClient.defaults.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Attempt to decrypt error response data if encrypted
    if ((error.response?.data as any)?.data) {
      try {
        (error.response!.data as any).data = parseResponse((error.response!.data as any).data);
      } catch {
        // leave as-is if decryption fails
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;