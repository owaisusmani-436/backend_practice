import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser'


const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true,
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended : true , limit : '16kb'}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import 
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/users" , userRouter)

// 404 handler (keep after routes)
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Global error handler (so Postman gets JSON instead of HTML)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    const statusCode = err?.statusCode || err?.status || 500;
    const message = err?.message || "Internal Server Error";

    return res.status(statusCode).json({
        success: false,
        message,
        errors: err?.errors || [],
    });
});

export {app}