// domain/CategoryPort.ts
import { Comments } from "./comments";


export interface CommentsPort {
 
  createComments(category: Omit<Comments, "id" | "fechaCreacion">): Promise<number>;
  getCommentsById(id: number): Promise<Comments | null>;
  updateComments(id: number, comments: Partial<Comments>): Promise<boolean>; 
  /*
  getAllComments(): Promise<Comments[]>;
  */
  
}