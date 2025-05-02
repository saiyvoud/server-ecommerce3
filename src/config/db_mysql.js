import mysql from "mysql";
import PrismaClient from "prisma/prisma-client"
const connected = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "db_ecommerce3"
});
connected.query(()=>{
    console.log(`Connected Database`);
});
const insert = "insert into user (id,name,email) valuse (?,?,?)"
connected.query(insert,(err)=>{
    if(err) throw
     console.log(`Success`);
})
const prisma = new PrismaClient()
prisma.user.create({data: {
    
}})

export default connected;
