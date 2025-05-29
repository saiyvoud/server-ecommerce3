import { ValidateData } from "../service/validate.js";
import { EMessage, SMessage } from "../service/message.js";
import { SendCreate,SendSuccess, SendError } from "../service/response.js";
import { UploadImageToCloud } from "../config/cloudinary.js";
import { PrismaClient } from "@prisma/client";
export default class BannerController {
    static async SelectAll(req, res) {
        try {
            const prisma = new PrismaClient();
            const data = await prisma.banner.findMany();
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectAll, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async SelectOne(req, res) {
        try {
            const banner_id = req.params.banner_id;
            const prisma = new PrismaClient;
            const data = await prisma.banner.findFirst({ where: { banner_id: banner_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.SelectOne, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async Insert(req, res) {
        try {
            const { title, detail } = req.body;
            const validate = await ValidateData({ title, detail });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join(","))
            }
            const image = req.files;
            if (!image || !image.files) {
                return SendError(res, 400, EMessage.BadRequest, "Files")
            }
           
            const img_url = await UploadImageToCloud(image.files.data, image.files.mimetype);
            if (!img_url) {
                return SendError(res, 404, EMessage.EUpload);
            }
            const prisma = new PrismaClient();
            const data = await prisma.banner.create({ data: { title, detail, image: img_url } });

            return SendCreate(res, SMessage.Insert, data);
        } catch (error) {
            
            return SendError(res, 500, EMessage.ServerInternal, error)
        }
    }
    static async UpdateBanner(req, res) {
        try {
            const banner_id = req.params.banner_id;
            if (!banner_id) return SendError(res, 400, EMessage.BadRequest);
            const { title, detail } = req.body;
            const validate = await ValidateData({ title, detail });
            if (validate.length > 0) {
                return SendError(res, 400, EMessage.BadRequest, validate.join("."))
            }
            const image = req.files;
            if (!image || !image.files) {
                return SendError(res, 400, EMessage.BadRequest, "Files")
            }
            const img_url = await UploadImageToCloud(image.files.data, image.files.mimetype);
            if (!img_url) {
                return SendError(res, 404, EMessage.EUpload);
            }

            const prisma = new PrismaClient();
            await prisma.banner.updateMany({
                data: {
                    title, detail, image: img_url
                }, where: { banner_id: banner_id }
            })
            return SendSuccess(res, SMessage.Update);

        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
    static async DeleteBanner(req, res) {
        try {
            const banner_id = req.params.banner_id
            const prisma = new PrismaClient();
            const data = await prisma.banner.delete({ where: { banner_id: banner_id } });
            if (!data) return SendError(res, 404, EMessage.NotFound);
            return SendSuccess(res, SMessage.Delete, data);
        } catch (error) {
            return SendError(res, 500, EMessage.ServerInternal, error);
        }
    }
}