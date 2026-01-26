import dotenv from "dotenv";
import connectDB from "./db/index.db.js";

dotenv.config({
  path: "./.env",
});

connectDB()

// this ()() is iffy means function is going to xecute imediately
/*
(async () => {
    try {
        
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

    } catch (error) {
        console.error("ERROR" , error)
        throw error
    }
})()
    */
