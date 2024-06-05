var CryptoJS = require("crypto-js");

const key = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY;

export const encrypt = (value) => {
    const encryptedValue  = CryptoJS.AES.encrypt(value, key);
    return encryptedValue;
};

export const decrypt = (value) => {
    const decryptedValue  = CryptoJS.AES.decrypt(value, key);
    var originalValue = decryptedValue.toString(CryptoJS.enc.Utf8);
    console.log(originalValue);
    return originalValue;
};