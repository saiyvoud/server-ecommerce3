
import { EMessage } from "../service/message.js";
import { SendError } from "../service/response.js";
import { VerifyToken } from "../service/service.js";

export const auth = async (req,res,next)=>{
    try {
        const token = req.headers.authorization;
        if(!token){
            return SendError(res,401,EMessage.Uanthorization)
        }
        const bearerToken = token.replace("Bearer ","")
        const verify = await VerifyToken(bearerToken);
        if(!verify) return SendError(res,404,EMessage.NotFound);
        req.user = verify.user_id;
        next()
    } catch (error) {
        console.log(error);
        return ""
    }
}