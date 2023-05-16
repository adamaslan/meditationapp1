import { useEffect, useState } from 'react';
import { getDataFromDB } from '../../components/Search3';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import Link from "next/link";

export default function MeditationPage({ meditation3 }) {
  const [meditationData, setMeditationData] = useState(meditation3);

  const data = meditation3.map((d) => ({
    ...d,
    counter_value: parseInt(d.counter_value),
    increment: parseInt(d.increment),
    date: isNaN(Date.parse(d.date)) ? d.date : new Date(d.date),
  }));

  useEffect(() => {
    setMeditationData(meditation3);
  }, [meditation3]);

  if (meditationData.length === 0) {
    return <div>Loading...</div>;
  }



  const dataByDayOfWeek = data.reduce((acc, curr) => {
    const dayOfWeek = curr.date.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
    acc[dayOfWeek] = acc[dayOfWeek] ? acc[dayOfWeek] + curr.increment : curr.increment;
    return acc;
  }, {});



  const dayOfWeekTotals = [
    { dayOfWeek: 0, dayOfWeekName: 'Sunday', total: dataByDayOfWeek[0] || 0 },
    { dayOfWeek: 1, dayOfWeekName: 'Monday', total: dataByDayOfWeek[1] || 0 },
    { dayOfWeek: 2, dayOfWeekName: 'Tuesday', total: dataByDayOfWeek[2] || 0 },
    { dayOfWeek: 3, dayOfWeekName: 'Wednesday', total: dataByDayOfWeek[3] || 0 },
    { dayOfWeek: 4, dayOfWeekName: 'Thursday', total: dataByDayOfWeek[4] || 0 },
    { dayOfWeek: 5, dayOfWeekName: 'Friday', total: dataByDayOfWeek[5] || 0 },
    { dayOfWeek: 6, dayOfWeekName: 'Saturday', total: dataByDayOfWeek[6] || 0 },
  ];

  return (
      <div>
        <h1>Days of the week</h1>
        <BarChart width={1160} height={500} data={dayOfWeekTotals}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dayOfWeek" tickFormatter={(dayOfWeek) => dayOfWeekTotals.find((item) => item.dayOfWeek === dayOfWeek).dayOfWeekName} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="#8884d8" />
        </BarChart>
        <a href="/posts/featuredfeature" className="card">
          <h3>Featured App Feature &rarr;</h3>
          <p>Our most fun new feature</p>
        </a>

        <a href="/posts/anothergraph2.js" className="card">
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
