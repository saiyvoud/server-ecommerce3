import { EMessage, SMessage } from "../service/message.js";
import { SendCreate, SendError, SendSuccess } from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import { PrismaClient } from '@prisma/client';
import { EncryptData, CheckEmail, DecryptData, GenerateToken, FindOneEmail, VerifyRefreshToken, FindOneUserId } from "../service/service.js";
import { UploadImageToCloud } from "../config/cloudinary.js";

export default class UserController {
    static async SelectAll(req, res) {
        try {
            const prisma = new PrismaClient();
            const data = await prisma.user.findMany();
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectAll, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async SelectOne(req, res) {
        try {
            const user_id = req.user;
            const prisma = new PrismaClient();
            const data = await prisma.user.findFirst({ where: { user_id: user_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }

    static async Login(req, res) {
        try {
            const { email, password } = req.body;
            const validate = await ValidateData({ email, password });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(","))
            }
            const checkEmail = await FindOneEmail(email);
            const decrypt = await DecryptData(checkEmail.password);
            if (decrypt !== password) {
                return SendError(res, 400, EMessage.PasswordNotMatch)
            }
            const token = await GenerateToken(checkEmail.user_id);
            const data = Object.assign(
                JSON.parse(JSON.stringify(checkEmail)),
                JSON.parse(JSON.stringify(token)),
            );
            data.password = undefined;
            return SendCreate(res, SMessage.Login, data);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error)

        }
    }
    static async Register(req, res) {
        try {
            const prisma = new PrismaClient();
            const { username, email, password, phoneNumber } = req.body;
            const validate = await ValidateData({ username, email, password, phoneNumber });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','))
            }
            await CheckEmail(email)
            const generatePassword = await EncryptData(password);
            if (!generatePassword) {
                return SendError(res, 404, EMessage.NotFound)
            }
            const data = await prisma.user.create({
                data: {
                    username, email,
                    password: generatePassword,
                    phoneNumber: parseInt(phoneNumber)
                }
            });
            if (!data) {
                return SendError(res, 404, EMessage.NotFound)
            }
            data.password = undefined
            return SendSuccess(res, SMessage.Register, data);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async ForgotPassword(req, res) {
        try {
            const prisma = new PrismaClient()
            const { email, newPassword } = req.body;
            const validate = await ValidateData({ email, newPassword });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(","));
            }
            const checkEmail = await FindOneEmail(email);
            if (!checkEmail) return SendError(res, 404, EMessage.NotFound);
            const generatePassword = await EncryptData(newPassword)
            const update = await prisma.user.update({
                data: {
                    password: generatePassword,
                }, where: { email: email }
            });
            if (!update) return SendError(res, 404, "Error Forgot password");
            return SendSuccess(res, SMessage.Forgot)
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async ChanagePassword(req, res) {
        try {
            const user_id = req.user;
            if (!user_id) return SendError(res, 400, EMessage.BadRequest);
            const { oldPassword, newPassword } = req.body;
            const validate = await ValidateData({ oldPassword, newPassword });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(","))
            }
            const data = await FindOneUserId(user_id);
            const decrypt = await DecryptData(data.password);
            if (oldPassword !== decrypt) {
                return SendError(res, 400, EMessage.PasswordNotMatch)
            }
            const generatePassword = await EncryptData(newPassword);
            const prisma = new PrismaClient()
            const update = await prisma.user.update({
                data: { password: generatePassword, },
                where: { user_id: user_id },
            });

            if (!update) return SendError(res, 404, EMessage.EUpdate);
            return SendSuccess(res, SMessage.ChangePassword)
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async RefreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) return SendError(res, 400, EMessage.BadRequest, "refreshToken");
            const verify = await VerifyRefreshToken(refreshToken);
            if (!verify) return SendError(res, 404, EMessage.NotFound);
            const token = await GenerateToken(verify.user_id);
            // const data = Object.assign(
            //     JSON.parse(JSON.stringify(verify)),
            //     JSON.parse(JSON.stringify(token)),
            // );
            //data.password = undefined;
            return SendSuccess(res, SMessage.Refresh, token);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async UpdateProfile(req, res) {
        try {
            const user_id = req.user;
            if (!user_id) return SendError(res, 400, EMessage.BadRequest);
            const { username, phoneNumber } = req.body;
            const validate = await ValidateData({ username, phoneNumber });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(","))
            }
            const profile = req.files;
            if (!profile || !profile.files) {
                return SendError(res, 400, EMessage.BadRequest, 'file')
            }
            const image_url = await UploadImageToCloud(profile.files.data, profile.files.mimetype);
            if (!image_url) {
                return SendError(res, 404, EMessage.EUpload);
            }
            console.log(image_url);
            const prisma = new PrismaClient();
             await prisma.user.updateMany({
                data: {
                    username: username,
                    phoneNumber: parseInt(phoneNumber),
                    profile: image_url,
                }, where: { user_id: user_id }
            })
            return SendSuccess(res, SMessage.Update);

        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async DeleteUserOne(req, res) {
        try {
            const user_id = req.params.user_id
            const prisma = new PrismaClient();
            const data = await prisma.user.delete({ where: { user_id: user_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.Delete, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
}