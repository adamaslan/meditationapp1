const { PrismaClient } = require('@prisma/client');


export const prisma = new PrismaClient();
export const getDataFromDB = async () => {
    return await prisma.meditation3.findMany();


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
