import "./infraestructure/config/enviroment-vars"; // Importa las variables de entorno y las valida antes de iniciar la aplicación
import app from './infraestructure/web/app';
import { ServerBootstrap } from './infraestructure/boostrap/server.boostrap';
import { connectDB } from "./infraestructure/config/data-base";


const server = new ServerBootstrap(app);


(async () => {
    try {
        await connectDB(); // Conectar a la base de datos antes de iniciar el servidor
        const instances = [server.init()];
        await Promise.all(instances);
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1); // Salir del proceso en caso de error
    }
}
)();