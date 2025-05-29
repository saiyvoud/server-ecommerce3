import { ValidateData } from "../service/validate.js";
import { EMessage, SMessage } from "../service/message.js";
import { SendCreate,SendSuccess, SendError } from "../service/response.js";
import { PrismaClient } from "@prisma/client";
export default class CategoryController {
    static async SelectAll(req, res) {
        try {
            const prisma = new PrismaClient();
            const data = await prisma.category.findMany();
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectAll, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async SelectOne(req, res) {
        try {
            const category_id = req.params.category_id;
            const prisma = new PrismaClient();
            const data = await prisma.category.findFirst({ where: { category_id: category_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async Insert(req, res) {
        try {
            const { categoryName} = req.body;
            const validate = await ValidateData({ categoryName});
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(","))
            }
         
            const prisma = new PrismaClient();
            const data = await prisma.category.create({ data: { categoryName } });
            if(!data) return SendError(res,404,EMessage.EInsert)
            return SendCreate(res, SMessage.Insert, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async UpdateCategory(req, res) {
        try {
            const category_id = req.params.category_id;
            if (!category_id) return SendError(res, 400, EMessage.BadRequest);
            const { categoryName} = req.body;
            const validate = await ValidateData({ categoryName});
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join("."))
            }
            const prisma = new PrismaClient();
            await prisma.category.update({
                data: {
                    categoryName
                }, where: { category_id: category_id }
            })
            return SendSuccess(res, SMessage.Update);

        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async DeleteCategory(req, res) {
        try {
            const category_id = req.params.category_id
            const prisma = new PrismaClient();
            const data = await prisma.category.delete({ where: { category_id: category_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.Delete, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
}