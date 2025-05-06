import { EMessage, SMessage } from "../service/message.js";
import { SendError, SendSuccess } from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import { PrismaClient } from '@prisma/client';

export default class UserController {
    static async Register(req, res) { // request,response
        try {
            const prisma = new PrismaClient();
            const { username, email, password, phoneNumber } = req.body;
            const validate = await ValidateData({ username, email, password, phoneNumber });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','))
            }
            const data = await prisma.user.create({
                data: {
                    username, email, password, phoneNumber: parseInt(phoneNumber)
                }
            });
            if (!data) {
                return SendError(res, 404, EMessage.NotFound)
            }
            return SendSuccess(res, SMessage.Register, data);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
}