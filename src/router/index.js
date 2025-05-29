import express from "express";
import AddressController from "../controller/address.js";
import BannerController from "../controller/banner.js";
import CategoryController from "../controller/category.js";
import OrderController from "../controller/order.js";
import OrderDetailController from "../controller/orderDetail.js";
import ProductController from "../controller/product.js";
import UserController from "../controller/user.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();
//----- user -----
router.post("/user/register", UserController.Register);
router.post("/user/login", UserController.Login);
router.get("/user/selAll", auth, UserController.SelectAll);
router.get("/user/selOne", auth, UserController.SelectOne);
router.put("/user/forgot", UserController.ForgotPassword);
router.put("/user/changePassword", auth, UserController.ChanagePassword);
router.put("/user/updateProfile", auth, UserController.UpdateProfile);
router.put("/user/refresh", UserController.RefreshToken);
router.delete("/user/delete/:user_id", auth, UserController.DeleteUserOne);
//------ banner ----
router.post("/banner/insert", auth, BannerController.Insert);
router.get("/banner/selAll", BannerController.SelectAll);
router.get("/banner/selOne/:banner_id", BannerController.SelectOne);
router.put("/banner/update/:banner_id", auth, BannerController.UpdateBanner);
router.delete("/banner/delete/:banner_id", auth, BannerController.DeleteBanner);
//------ category ----
router.post("/category/insert", auth, CategoryController.Insert);
router.get("/category/selAll", CategoryController.SelectAll);
router.get("/category/selOne/:category_id", CategoryController.SelectOne);
router.put("/category/update/:category_id", auth, CategoryController.UpdateCategory);
router.delete("/category/delete/:category_id", auth, CategoryController.DeleteCategory);
//------ product ----
router.post("/product/insert", auth, ProductController.Insert);
router.get("/product/selAll", ProductController.SelectAll);
router.get("/product/search", ProductController.SearchProduct);
router.get("/product/selBy/:categoryId", ProductController.SelectBy);
router.get("/product/selOne/:product_id", ProductController.SelectOne);
router.put("/product/update/:product_id", auth, ProductController.UpdateProduct);
router.delete("/product/delete/:product_id", auth, ProductController.DeleteProduct);
//------ address ----
router.post("/address/insert", auth, AddressController.Insert);
router.get("/address/selAll", AddressController.SelectAll);
router.get("/address/selOne/:address_id", AddressController.SelectOne);
router.put("/address/update/:address_id", auth, AddressController.UpdateAddress);
router.delete("/address/delete/:address_id", auth, AddressController.DeleteAddress);
//------ order ----
router.post("/order/insert", auth, OrderController.Insert);
router.get("/order/selAll", OrderController.SelectAll);
router.get("/order/selOne/:order_id", OrderController.SelectOne);
router.get("/order/selBy", auth, OrderController.SelectBy);
router.get("/order/selByUser", auth,OrderController.SelectByUser);
router.put("/order/updateStatus/:order_id", auth, OrderController.UpdateStatus);
router.delete("/order/delete/:order_id", auth, OrderController.DeleteOrder);
//------ order Detail ----
router.post("/orderDetail/insert", auth,  OrderDetailController.Insert);
router.get("/orderDetail/selAll",  OrderDetailController.SelectAll);
router.get("/orderDetail/selOne/:order_detail_id",  OrderDetailController.SelectOne);
router.get("/orderDetail/selBy/:order_id",  OrderDetailController.SelectBy);
router.delete("/orderDetail/delete/:order_detail_id", auth,  OrderDetailController.DeleteOrderDetail);
export default router;