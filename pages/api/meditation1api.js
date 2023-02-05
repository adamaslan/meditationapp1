// import { prisma } from "../../components/Search2";
// export default async (req, res) => {
//   const { searchDB } = req.query;
//   console.log(searchDB);
//   try {
//     const results = await prisma.meditation3.findMany({
//       where: {
//         OR: [
//           { time_stamp: { contains: searchDB } },
//           { date: { contains: searchDB } },
//           { time: { contains: searchDB } },
//           { counter_value: { contains: searchDB } },
//           { increment: { contains: searchDB } },
//         ],
//       },
//     });
//     const cleanResult = results.map((meditation) => ({
//       ...meditation,
//       id: "abc",
//     }));
//     res.status(200).json(cleanResult);
//   } catch (err) {
//     console.log(err);
//     res
//       .status(403)
//       .json({ err: "Error occured while searching meditation data." });
//   }
// };
