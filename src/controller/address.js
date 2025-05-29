import { ValidateData } from "../service/validate.js";
import { EMessage, SMessage } from "../service/message.js";
import { SendCreate, SendSuccess, SendError } from "../service/response.js";
import { FindOneUserId } from "../service/service.js";
import { PrismaClient } from "@prisma/client";
export default class AddressController {
    static async SelectAll(req, res) {
        try {
            const prisma = new PrismaClient();
            const data = await prisma.address.findMany();
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectAll, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async SelectOne(req, res) {
        try {
            const address_id = req.params.address_id;
            const prisma = new PrismaClient();
            const data = await prisma.address.findFirst({ where: { address_id: address_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async Insert(req, res) {
        try {
            const userId = req.user;
            const { express, village, district, province, destinationNumber } = req.body;
            const validate = await ValidateData({ express, village, district, province, destinationNumber });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(","))
            }
            await FindOneUserId(userId);
            const prisma = new PrismaClient();
            const data = await prisma.address.create({
                data: {
                    userId, express, village,
                    district, province, destinationNumber: parseInt(destinationNumber)
                }
            });
            return SendCreate(res, SMessage.Insert, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async UpdateAddress(req, res) {
        try {
            const address_id = req.params.address_id;
            const userId = req.user;
            if (!address_id) return SendError(res, 400, EMessage.BadRequest);
            const { express, village, district, province, destinationNumber } = req.body;
            const validate = await ValidateData({ express, village, district, province, destinationNumber });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join("."))
            }
            await FindOneUserId(userId);
            const prisma = new PrismaClient();
            await prisma.address.updateMany({
                data: {
                    userId, express, village, district,
                    province, destinationNumber: parseInt(destinationNumber)
                }, where: { address_id: address_id }
            })
            return SendSuccess(res, SMessage.Update);

        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async DeleteAddress(req, res) {
        try {
            const address_id = req.params.address_id
            const prisma = new PrismaClient();
            const data = await prisma.address.delete({ where: { address_id: address_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.Delete, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
}