import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
export const getDataFromDB = async () => {
const data = await prisma.meditation3.findMany();
return data;
};

// const getDataFromDB = async () => {
//   try {
//     const data = await prisma.meditation3.findMany();
//     return data;
//   } catch (error) {
//     console.error(error);
//   } finally {
//     await prisma.disconnect();
//   }
// };
