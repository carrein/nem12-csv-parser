import { Request, Response } from "express";
import { getAllBooks } from "../services/book.service";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const all = async (req: Request, res: Response): Promise<any> => {
  try {
    const result = await getAllBooks();
    return res.status(200).send(result);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong" });
  }
};
