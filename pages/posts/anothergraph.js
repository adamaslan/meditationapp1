import { useEffect, useState } from 'react';
import { getDataFromDB } from '../../components/Search3';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import Link from "next/link";
import dayjs from 'dayjs';


export default function MeditationPage({ meditation3 }) {
  const [meditationData1, setMeditationData1] = useState(meditation3);



  const data = meditation3.map((d) => ({
    ...d,
    counter_value: parseInt(d.counter_value),
    time_stamp: parseInt(d.time_stamp),
    increment: parseInt(d.increment),
    date: isNaN(Date.parse(d.date)) ? d.date : new Date(d.date),
  }));

  useEffect(() => {
    setMeditationData1(meditation3);
  }, [meditation3]);



  if (meditationData1.length === 0) {
    return <div>Loading...</div>;
  }





  // const hourTotals = data.reduce((acc, curr) => {
  //   const date = new Date(curr.time_stamp);
  //   const hour = date.getHours();
  //   if (!acc[hour]) acc[hour] = 0;
  //   acc[hour] += curr.increment;
  //   return acc;
  // }, {});

  // const hourTotal = Object.entries(hourTotals).map(([hour, total]) => ({
  //   hour: parseInt(hour),
  //   totalIncrements: total,
  // }));
  // const dataByHourOfDay = data.reduce((acc, { time_stamp, increment }) => {
  //   const hourOfDay = new Date(time_stamp).getHours();
  //   acc[hourOfDay] = (acc[hourOfDay] || 0) + increment;
  //   return acc;
  // }, []);
  // console.log(dataByHourOfDay);


  const dataByHourOfDay = data.reduce((acc, { time_stamp, increment }) => {
    const hourOfDay = new Date(time_stamp).getHours();
    console.log (hourOfDay);
    if (!acc[hourOfDay]) {
      acc[hourOfDay] = { hourOfDay, total: 0 };
    }
    acc[hourOfDay].total += increment;
    return acc;
  }, []);




  const hoursOfDayTotals  = [
    { hourOfDay: 0, hourOfDayName: '1am', total: dataByHourOfDay[0] || 0 },
    { hourOfDay: 1, hourOfDayName: '2am', total: dataByHourOfDay[1] || 0 },
    { hourOfDay: 2, hourOfDayName: '3am', total: dataByHourOfDay[2] || 0 },
    { hourOfDay: 3, hourOfDayName: '4am', total: dataByHourOfDay[3] || 0 },
    { hourOfDay: 4, hourOfDayName: '5am', total: dataByHourOfDay[4] || 0 },
    { hourOfDay: 5, hourOfDayName: '6am', total: dataByHourOfDay[5] || 0 },
    { hourOfDay: 6, hourOfDayName: '7am', total: dataByHourOfDay[6] || 0 },
    { hourOfDay: 7, hourOfDayName: '8am', total: dataByHourOfDay[7] || 0 },
    { hourOfDay: 8, hourOfDayName: '9am', total: dataByHourOfDay[8] || 0 },
    { hourOfDay: 9, hourOfDayName: '10am', total: dataByHourOfDay[9] || 0 },
    { hourOfDay: 10, hourOfDayName: '11am', total: dataByHourOfDay[10] || 0 },
    { hourOfDay: 11, hourOfDayName: '12pm', total: dataByHourOfDay[11] || 0 },
    { hourOfDay: 12, hourOfDayName: '1pm', total: dataByHourOfDay[12] || 0 },
    { hourOfDay: 13, hourOfDayName: '2pm', total: dataByHourOfDay[13] || 0 },
    { hourOfDay: 14, hourOfDayName: '3pm', total: dataByHourOfDay[14] || 0 },
    { hourOfDay: 15, hourOfDayName: '4pm', total: dataByHourOfDay[15] || 0 },
    { hourOfDay: 16, hourOfDayName: '5pm', total: dataByHourOfDay[16] || 0 },
    { hourOfDay: 17, hourOfDayName: '6pm', total: dataByHourOfDay[17] || 0 },
    { hourOfDay: 18, hourOfDayName: '7pm', total: dataByHourOfDay[18] || 0 },
    { hourOfDay: 19, hourOfDayName: '8pm', total: dataByHourOfDay[19] || 0 },
    { hourOfDay: 20, hourOfDayName: '9pm', total: dataByHourOfDay[20] || 0 },
    { hourOfDay: 21, hourOfDayName: '10pm', total: dataByHourOfDay[21] || 0 },
    { hourOfDay: 22, hourOfDayName: '11pm', total: dataByHourOfDay[22] || 0 },
    { hourOfDay: 23, hourOfDayName: '12am', total: dataByHourOfDay[23] || 0 },
  ];

//   const dataByHourOfDay = Object.values(data.reduce((result, { time_stamp, increment }) => {
//     const hour = new Date(Date.parse(time_stamp)).getHours();
// console.log(hour)
//     result[hour] = { hourOfDay: hour, total: (result[hour]?.total || 0) + increment };
//     return result;
//   }, {}));

  // const dataByHourOfDay = data.reduce((acc, { time_stamp, increment }) => {
  //   const hour = new Date(Date.parse(time_stamp)).getHours();
  //    console.log(hour)
  //   const hourObj = acc.find(obj => obj.hourOfDay === hour);
  //   if (hourObj) {
  //     hourObj.total += increment;
  //   } else {
  //     acc.push({ hourOfDay: hour, total: increment });
  //   }
  //   return acc;
  // }, []);
  //
  //
  // console.log(dataByHourOfDay);
  const januaryStamps = data.reduce((acc, { time_stamp }) => {
    const timestamp = dayjs(time_stamp);
    if (timestamp.month() === 0) {
      acc.push(time_stamp);
    }
    return acc;
  }, []);

  console.log(januaryStamps, "poop");


  return (
      <div>
        <h1>Top hours by total increment</h1>
        <BarChart width={600} height={300} data={dataByHourOfDay}>
          <XAxis dataKey="hourOfDay" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#8884d8" />
        </BarChart>
        <a href="/posts/featuredfeature" className="card">
          <h3>Featured App Feature &rarr;</h3>
          <p>Our most fun new feature</p>
        </a>

        <a href="/posts/anothergraph" className="card">
          <h3>More Graphs &rarr;</h3>
          <p>Fun Fun Fun</p>
        </a>

        <Link href="/">Back to home</Link>
      </div>
  );


     
}

export const getServerSideProps = async () => {
  const meditation3 = await getDataFromDB();
  const cleanResult = meditation3.map((data) => ({
    time_stamp: data.time_stamp.toString(),
    date: new Date(data.date),
    time: data.time,
    counter_value: data.counter_value.toString(),
    increment: data.increment.toString(),
  }));
  return {
    props: {
      meditation3: JSON.parse(JSON.stringify(cleanResult)),
    },
  };
};



// import { useEffect, useState } from 'react';
// import { getDataFromDB } from '../../components/Search3';
// import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
//
// export default function MeditationPage({ meditation3 }) {
//   const [meditationData, setMeditationData] = useState(meditation3);
//
//   const data = meditation3.map((d) => ({
//     ...d,
//     counter_value: parseInt(d.counter_value),
//     increment: parseInt(d.increment),
//     date: isNaN(Date.parse(d.date)) ? d.date : new Date(d.date),
//   }));
//
//   useEffect(() => {
//     setMeditationData(meditation3);
//   }, [meditation3]);
//
//   if (meditationData.length === 0) {
//     return <div>Loading...</div>;
//   }
//
//   const dataByDayOfWeek = data.reduce((acc, curr) => {
//     const dayOfWeek = curr.date.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
//     acc[dayOfWeek] = acc[dayOfWeek] ? acc[dayOfWeek] + curr.increment : curr.increment;
//     return acc;
//   }, {});
//
//   const dayOfWeekTotals = [
//     { dayOfWeek: 0, dayOfWeekName: 'Sunday', total: dataByDayOfWeek[0] || 0 },
//     { dayOfWeek: 1, dayOfWeekName: 'Monday', total: dataByDayOfWeek[1] || 0 },
//     { dayOfWeek: 2, dayOfWeekName: 'Tuesday', total: dataByDayOfWeek[2] || 0 },
//     { dayOfWeek: 3, dayOfWeekName: 'Wednesday', total: dataByDayOfWeek[3] || 0 },
//     { dayOfWeek: 4, dayOfWeekName: 'Thursday', total: dataByDayOfWeek[4] || 0 },
//     { dayOfWeek: 5, dayOfWeekName: 'Friday', total: dataByDayOfWeek[5] || 0 },
//     { dayOfWeek: 6, dayOfWeekName: 'Saturday', total: dataByDayOfWeek[6] || 0 },
//   ];
//
//   return (
//       <div>
//         <h1>Meditation Chart</h1>
//         <BarChart width={1160} height={500} data={dayOfWeekTotals}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="dayOfWeek" tickFormatter={(dayOfWeek) => dayOfWeekTotals.find((item) => item.dayOfWeek === dayOfWeek).dayOfWeekName} />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Bar dataKey="total" fill="#8884d8" />
//         </BarChart>
//       </div>
//   );
// }