import Link from "next/link";
import Head from "next/head";
import Layout from "../../components/layout";
import { useState, useEffect } from "react";
import { getDataFromDB } from "../../components/Search3";
export function dateUi({ meditation3 }) {
  console.log(meditation3);
  const [columns, setColumns] = useState(
    Array(7)
      .fill()
      .map(() => [])
  );

  useEffect(() => {
    const newColumns = Array(7)
      .fill()
      .map(() => []);
    meditation3.forEach((element) => {
      const dayOfWeek = new Date(element.time_stamp).getDay();
      newColumns[dayOfWeek].push(element);
    });
    const sortedColumns = newColumns.map((column) =>
      column.sort((a, b) => new Date(b.time_stamp) - new Date(a.time_stamp))
    );
    setColumns(sortedColumns);
  }, [meditation3]);
  return (
    <div style={{ display: "flex" }}>
      {columns.map((column, index) => (
        <ul key={index}>
          <h3>
            {
              [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ][index]
            }
          </h3>
          {column.map((element, index) => (
            <li key={index}>{element}</li>
          ))}
        </ul>
      ))}
    </div>
  );
}

{
  /* // const daysOfWeek = [
//   "Sunday",
//   "Monday",
//   "Tuesday",
//   "Wednesday",
//   "Thursday",
//   "Friday",
//   "Saturday",
// ]; */
}

// // Initialize an object to store the data for each day of the week
// const dataByDayOfWeek = {
//   Sunday: 0,
//   Monday: 0,
//   Tuesday: 0,
//   Wednesday: 0,
//   Thursday: 0,
//   Friday: 0,
//   Saturday: 0,
// };

// export const data = {
//   labels: daysOfWeek,
//   datasets: [
//     {
//       label: "Meditation 3",
//       data: [],
//       backgroundColor: "rgba(255, 99, 132, 0.5)",
//     },
//   ],
// };

// export const  BarChart5 = ({ meditation3 }) => {
//     // console.log(meditation3);
//     meditation3.forEach((item) => {
//       // Extract the day of the week from the time_stamp field
//       const date = new Date(item.time_stamp);
//       const dayOfWeek = daysOfWeek[date.getUTCDay()];

//       // Add the increment value to the total for that day of the week
//       dataByDayOfWeek[dayOfWeek] += item.increment;
//       console.log(dataByDayOfWeek);
//     });

//     // Convert the dataByDayOfWeek object into an array for use in the chart
//     const dataArray = [];
//     daysOfWeek.forEach((day) => {
//       dataArray.push(dataByDayOfWeek[day]);
//     });

//     data.datasets[0].data = dataArray;

//     // return <Bar options={options} data={data} width={600} height={370} />;
//   }

// const TicksPerDay = ({ dataByDayOfWeek }) => {
//   return (
//     <div>
//       {Object.entries(dataByDayOfWeek).map(([day, count]) => (
//         <div key={day}>
//           {day}: {count} ticks
//         </div>
//       ))}
//     </div>
//   );

// const TicksPerDay = ({ meditation3 }) => {
//   let dataByDayOfWeek = {
//     Sunday: 0,
//     Monday: 0,
//     Tuesday: 0,
//     Wednesday: 0,
//     Thursday: 0,
//     Friday: 0,
//     Saturday: 0,
//   };

// const daysOfWeek = Object.keys(dataByDayOfWeek);
// currently messed up
// {
//   meditation3.forEach((item) => {
//     const date = new Date(item.time_stamp);
//     const dayOfWeek = daysOfWeek[date.getUTCDay()];

//     dataByDayOfWeek[dayOfWeek] += item.increment;
//   });
// }

// return (
//     <div>
//       {Object.entries(meditation3).map(([day, count]) => (
//         <div key={day}>
//           {day}: {count} ticks
//         </div>
//       ))}
//     </div>
//   );
// };

export default function CurrentShows({ meditation3 }) {
  return (
    <>
      <Layout>
        <Head>
          <title>Meditation Graph</title>
          <link rel="icon" href="/public/favicon.ico" />
          <meta name="description" content="Mean, Mode, Median type shih" />
          <meta
            property="og:image"
            content="https://res.cloudinary.com/adamaslan/image/upload/v1666992137/ZXY%20/zxy-logo_cos9hl.jpg"
          />
        </Head>
        <article>
          <h1>Most Meditative Days of the Week"</h1>
          <dateUi />
          {/* <TicksPerDay /> */}

          {/* <BarChart5 meditation3={meditation3} /> */}
          <div className="flex-container">
            <div className="flex-item">
              {/* <Image
                alt="art show"
                width={1072}
                height={872}
                src="https://res.cloudinary.com/adamaslan/image/upload/v1666992137/ZXY%20/Choral-show3_a4mibl.jpg"
              /> */}
            </div>
          </div>
          <p>A Graph</p>
          <p>
            Days of the week, times of the day, by month, focused periods (more
            than 4 counts in an hour)
          </p>

          <h2>
            <Link href="/">Back to home</Link>
          </h2>
        </article>
      </Layout>
    </>
  );
}

export const getServerSideProps = async () => {
  const meditation3 = await getDataFromDB();
  const cleanResult = meditation3.map((data) => ({
    time_stamp: data.time_stamp.toString(),
    date: data.date,
    time: data.time,
    counter_value: "abc",
    increment: data.increment.toString(),
  }));
  return {
    props: {
      meditation3: JSON.parse(JSON.stringify(cleanResult)),
    },
  };
};

// export const getServerSideProps = async () => {
//   const json = await getDataFromDB();
//   const newColumns = Array(7).fill().map(() => []);
//   json.forEach((element) => {
//     const dayOfWeek = new Date(element.timestamp).getDay();
//     newColumns[dayOfWeek].push(element);
//   });
//   const columns = newColumns.map((column) =>
//     column.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
//   );
//   return {
//     props: {
//       columns,
//     },
//   };
// };
