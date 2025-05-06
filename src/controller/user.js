import { EMessage, SMessage } from "../service/message.js";
import { SendCreate, SendError, SendSuccess } from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import { PrismaClient } from '@prisma/client';
import { EncryptData,CheckEmail, DecryptData, GenerateToken, FindOneEmail } from "../service/service.js";

export default class UserController {
    static async Login(req,res){
        try {
            const {email,password} = req.body;
            const validate = await ValidateData({email,password});
            if(validate.length>0){
                return SendError(res,400,EMessage.BadRequest,validate.join(","))
            }
            const checkEmail = await FindOneEmail(email);
            const decrypt = await DecryptData(checkEmail.password);
            if(decrypt !== password){
                return SendError(res,400,EMessage.PasswordNotMatch)
            }
            const token = await GenerateToken(checkEmail.user_id);
            const data = Object.assign(
                JSON.parse(JSON.stringify(checkEmail)),
                JSON.parse(JSON.stringify(token)),
            );
            data.password = undefined;
            return SendCreate(res,SMessage.Login,data);
        } catch (error) {
            console.log(error);
            return SendError(res,500,EMessage.ServerInternal,error)
;        }
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
}