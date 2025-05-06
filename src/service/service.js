import { PrismaClient } from "@prisma/client";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import { SECREAT_KEY, SECREAT_KEY_REFRESH } from "../config/globalKey.js";
import { EMessage } from "./message.js";
export const EncryptData = async (data) => {
    return CryptoJS.AES.encrypt(data, SECREAT_KEY).toString()
}
export const DecryptData = async (data) => {
    const decrypt = CryptoJS.AES.decrypt(data, SECREAT_KEY).toString(CryptoJS.enc.Utf8);
    return decrypt
}
export const CheckEmail = async (email) => {
    return new Promise(async (resovle, reject) => {
        try {
            const prisma = new PrismaClient();
            const data = await prisma.user.findFirst({ where: { email: email } });
            if (data) {
                return reject("Email is Already")
            }
            return resovle(data);
        } catch (error) {
            return reject(error)
        }
    })
}
export const FindOneEmail = async (email) => {
    return new Promise(async (resovle, reject) => {
        try {
            const prisma = new PrismaClient();
            const data = await prisma.user.findFirst({ where: { email: email } });
            if (!data) {
                return reject("Email Not Found")
            }
            return resovle(data);
        } catch (error) {
            return reject(error)
        }
    })
}

export const GenerateToken = async (data) => {
    return new Promise(async (resovle, reject) => {
        try {
            const payload = {
                id: data
            }
            const payload_refresh = {
                id: payload.id
            }
            const token = jwt.sign(payload, SECREAT_KEY, { expiresIn: "1h" });
            const refreshToken = jwt.sign(payload_refresh, SECREAT_KEY_REFRESH,
                { expiresIn: "3h" })
            return resovle({ token, refreshToken });
        } catch (error) {
            return reject(error);
        }
    })
}