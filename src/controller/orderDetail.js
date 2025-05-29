import { ValidateData } from "../service/validate.js";
import { EMessage, OrderStatus, SMessage } from "../service/message.js";
import { SendCreate, SendSuccess, SendError } from "../service/response.js";
import { FindOneOrder, FindOneProduct, FindOneUserId } from "../service/service.js";
import { PrismaClient } from "@prisma/client";
export default class OrderDetailController {
    static async SelectAll(req, res) {
        try {
            const prisma = new PrismaClient();
            const data = await prisma.orderDetail.findMany();
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectAll, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }

    static async SelectOne(req, res) {
        try {
            const order_detail_id = req.params.order_detail_id;
            const prisma = new PrismaClient();
            const data = await prisma.orderDetail.findFirst({ where: { order_detail_id: order_detail_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async SelectBy(req, res) {
        try {
            const order_id = req.params.order_id;
            const prisma = new PrismaClient();
            const data = await prisma.orderDetail.findMany({ where: { orderId: order_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectBy, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }

    static async Insert(req, res) {
        try {
            const { product_id, order_id, amount, total } = req.body;
            const validate = await ValidateData({ product_id, order_id, amount, total });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join("."))
            }
            await FindOneProduct(product_id);
            await FindOneOrder(order_id); // ສ້າງຢູ່ service 

            const prisma = new PrismaClient();
            const data = await prisma.orderDetail.create({
                data: {

                    order: {
                        connect: {
                            order_id: order_id
                        }
                    }, product: {
                        connect: {
                            product_id: product_id
                        }
                    }, amount: parseInt(amount), total: parseInt(total)
                }
            });
            return SendCreate(res, SMessage.Insert, data);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }

    static async DeleteOrderDetail(req, res) {
        try {
            const order_detail_id = req.params.order_detail_id
            const prisma = new PrismaClient();
            const data = await prisma.orderDetail.delete({ where: { order_detail_id: order_detail_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.Delete, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
}