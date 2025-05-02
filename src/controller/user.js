import { EMessage, SMessage } from "../service/message.js";
import { SendError, SendSuccess } from "../service/response.js";
import { ValidateData } from "../service/validate.js";

export default class UserController {
    static async Register(req, res) { // request,response
        try {
            const { username, email, password, phoneNumber } = req.body;
            const validate = await ValidateData({ username, email, password, phoneNumber });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(','))
            }
            return SendSuccess(res, SMessage.Register);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
}