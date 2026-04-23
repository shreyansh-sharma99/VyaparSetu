import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.SECRET_KEY || "default_secret_key";


export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};


export const decryptData = (cipherText: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8) || null;
  } catch (error) {
    return null;
  }
};
