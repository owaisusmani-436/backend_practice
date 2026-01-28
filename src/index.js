import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

import connectDB from "./db/index.db.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`server is running at port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("mongodb connection failed", err);
  });

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
