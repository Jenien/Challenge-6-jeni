import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import db from "./config/data.js";
// import {User, rolesEnum} from "./models/userModels.js";
import router from "./routes/index.routes.js";
import cookieParser from 'cookie-parser';
import morgan from "morgan";

dotenv.config();
const PORT = process.env.PORT || 4000; 
const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use('/api', router);
app.use(cors());
app.use(cookieParser());

app.listen(PORT, () => console.log(`Server up and running on port ${PORT}...`));
