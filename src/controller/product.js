import { ValidateData } from "../service/validate.js";
import { EMessage, SMessage } from "../service/message.js";
import { SendCreate, SendSuccess, SendError } from "../service/response.js";
import { FindOneCategory } from "../service/service.js";
import { PrismaClient } from "@prisma/client";
import { UploadImageToCloud } from "../config/cloudinary.js";
export default class ProductController {
    static async SearchProduct(req, res) {
        try {
            const search = req.query.search;
            const prisma = new PrismaClient();
            const data = await prisma.product.findMany({
                where: {
                    proName: { contains: search }
                }
            });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.Search, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async SelectAll(req, res) {
        try {
            const prisma = new PrismaClient();
            const data = await prisma.product.findMany();
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectAll, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async SelectOne(req, res) {
        try {
            const product_id = req.params.product_id;
            const prisma = new PrismaClient();
            const data = await prisma.product.findFirst({ where: { product_id: product_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async SelectBy(req, res) {
        try {
            const categoryId = req.params.categoryId;
            const prisma = new PrismaClient();
            const data = await prisma.product.findMany({ where: { categoryId: categoryId } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectBy, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async Insert(req, res) {
        try {
            const { proName, proDetail, proAmount, proPrice, categoryId } = req.body;
            const validate = await ValidateData({ proName, proDetail, proAmount, proPrice, categoryId });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(","))
            }
            await FindOneCategory(categoryId) // ສ້າງຢູ່ໃນ folder service file service
            const image = req.files;
            if (!image || !image.files) {
                return SendError(res, 400, EMessage.BadRequest, "Files")
            }
            const img_url = await UploadImageToCloud(image.files.data, image.files.mimetype);
            if (!img_url) {
                return SendError(res, 404, EMessage.EUpload);
            }
            const prisma = new PrismaClient();
            const data = await prisma.product.create({
                data: {
                    proName,
                    proDetail,
                    proAmount: parseInt(proAmount),
                    proPrice: parseInt(proPrice),
                    categoryId,
                    proImage: img_url
                }
            });
            if (!data) return SendError(res, 404, EMessage.EInsert)
            return SendCreate(res, SMessage.Insert, data);
        } catch (error) {
            console.log(error);
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async UpdateProduct(req, res) {
        try {
            const product_id = req.params.product_id;
            if (!product_id) return SendError(res, 400, EMessage.BadRequest);
            const { proName, proDetail, proAmount, proPrice, categoryId } = req.body;
            const validate = await ValidateData({ proName, proDetail, proAmount, proPrice, categoryId });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join("."))
            }
            await FindOneCategory(categoryId) // ສ້າງຢູ່ໃນ folder service file service
            const image = req.files;
            if (!image || !image.files) {
                return SendError(res, 400, EMessage.BadRequest, "Files")
            }
            const img_url = await UploadImageToCloud(image.files.data, image.files.mimetype);
            if (!img_url) {
                return SendError(res, 404, EMessage.EUpload);
            }
            const prisma = new PrismaClient();
            await prisma.product.updateMany({
                data: {
                    proName,
                    proDetail,
                    proAmount: parseInt(proAmount),
                    proPrice: parseInt(proPrice),
                    categoryId,
                    proImage: img_url
                }, where: { product_id: product_id }
            });
            return SendSuccess(res, SMessage.Update);

        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async DeleteProduct(req, res) {
        try {
            const product_id = req.params.product_id
            const prisma = new PrismaClient();
            const data = await prisma.product.delete({ where: { product_id: product_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.Delete, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
}