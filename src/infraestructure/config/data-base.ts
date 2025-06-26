import configDotenv from "dotenv";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Category } from "../entities/Category";
import { Priority } from "../entities/Priority";
import { Incident } from "../entities/Incident";

configDotenv.config();

export const AppDataSource = new DataSource ({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,//no se usa en produccion
    logging: true,
    entities: [User, Category, Priority, Incident],
});

//conectar a la base de datos
export const connectDB = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database connection established successfully.");
    } catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1); // Exit the process with failure
    }
};
