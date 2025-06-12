import { ValidateData } from "../service/validate.js";
import { EMessage, OrderStatus, SMessage } from "../service/message.js";
import { SendCreate, SendSuccess, SendError } from "../service/response.js";
import { FindOneUserId, FindOneAddressId } from "../service/service.js";
import { PrismaClient } from "@prisma/client";
import { UploadImageToCloud } from "../config/cloudinary.js"
export default class OrderController {
    static async SelectAll(req, res) {
        try {
            const prisma = new PrismaClient();
            const data = await prisma.order.findMany();
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectAll, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }

    static async SelectOne(req, res) {
        try {
            const order_id = req.params.order_id;
            const prisma = new PrismaClient();
            const data = await prisma.order.findFirst({ where: { order_id: order_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async SelectBy(req, res) {
        try {
            const status = req.query.status;
            const prisma = new PrismaClient();
            const data = await prisma.order.findMany({ where: { status: status } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async SelectByUser(req, res) {
        try {
            const user_id = req.user;
            const status = req.query.status
            const prisma = new PrismaClient();
            const checkStatus = Object.values(OrderStatus);
            if (!checkStatus.includes(status)) {
                return SendError(res, 404, EMessage.NotFound);
            }
            const data = await prisma.order.findMany({ where: { userId: user_id, status: status } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }


    static async Insert(req, res) {
        try {
            const userId = req.user;
            const prisma = new PrismaClient();
            const { address_id, totalPrice } = req.body;
            const validate = await ValidateData({ address_id, totalPrice });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join("."))
            }
            await FindOneUserId(userId);
            await FindOneAddressId(address_id); // ສ້າງຢູ່ service 
            // const image = req.files;
            // if (!image || !image.files) {
            //     return SendError(res, 400, EMessage.BadRequest, "Files")
            // }
            // const img_url = await UploadImageToCloud(image.files.data, image.files.mimetype);
            // if (!img_url) {
            //     return SendError(res, 404, EMessage.EUpload);
            // }

            const data = await prisma.order.create({
                data: {
                    user: {
                        connect: {
                            user_id: userId
                        }
                    }, address: {
                        connect: {
                            address_id: address_id
                        }
                    },
                    totalPrice: parseInt(totalPrice),
                }
            });

            return SendCreate(res, SMessage.Insert, data);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async UpdateStatus(req, res) {
        try {
            const order_id = req.params.order_id;
            if (!order_id) return SendError(res, 400, EMessage.BadRequest);
            const { status } = req.body;
            const validate = await ValidateData({ status });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join("."))
            }
            const checkStatus = Object.values(OrderStatus);
            if (!checkStatus.includes(status)) {
                return SendError(res, 400, EMessage.BadRequest)
            }

            const prisma = new PrismaClient();
            await prisma.order.update({
                data: {
                    status: status
                }, where: { order_id: order_id }
            })
            return SendSuccess(res, SMessage.Update);

        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async DeleteOrder(req, res) {
        try {
            const order_id = req.params.order_id
            const prisma = new PrismaClient();
            const data = await prisma.order.delete({ where: { order_id: order_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.Delete, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
}