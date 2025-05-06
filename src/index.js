import express from "express"; // ຂຽນແບບ ES 
import cors from "cors";
import router from "./router/index.js";
const app = express();
app.use(cors());
app.use(express.json({ extended: true }))
app.use(express.urlencoded({
   extended: true,
   limit: "500mb",
   parameterLimit: 5000
}))
app.use("/api", router);
app.listen(8000, () => {
   console.log(`http://localhost:8000`);
});
