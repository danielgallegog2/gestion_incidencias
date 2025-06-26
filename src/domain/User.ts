export interface User {
    id: number;
    name: string;
    email: string;
    rol: "empleado" | "soporte" | "administrador";
    password: string;
    status: number;
}