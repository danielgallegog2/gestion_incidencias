//aqui gestionaremos las rutas
import express, { Request, Response } from 'express';
import userRoutes from "../routes/UserRoutes";
import { categoryRouter } from "../routes/categoryRoutes";
import { priorityRouter } from "../routes/priorityRoutes";
import { incidentRouter } from "../routes/incidentRoutes";
import { CommentsRouter } from "../routes/commentsRoutes";
import cors from "cors"

class App{

    private app: express.Application;

    constructor() {
        this.app = express();
        this.middleware();
        this.routes();
    }

    private middleware(): void {
        this.app.use(cors());
        this.app.use(express.json());
    }

    private routes(): void{
        this.app.use('/api',userRoutes);
        this.app.use("/api", categoryRouter);
        this.app.use("/api", priorityRouter);
        this.app.use("/api", incidentRouter);
        this.app.use("/api", CommentsRouter);
    }

    getApp(){
        return this.app;
    }
}

export default new App().getApp();