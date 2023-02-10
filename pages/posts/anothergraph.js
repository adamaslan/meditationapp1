import Link from "next/link";
import Head from "next/head";
import Layout from "../../components/layout";

import { getDataFromDB } from "../../components/Search3";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  maintainAspectRatio: false,
  responsive: false,
  plugins: {
    legend: {
      position: "top",
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    title: {
      display: true,
      text: "Meditation 3 by Day of Week",
    },
  },
};

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Initialize an object to store the data for each day of the week
const dataByDayOfWeek = {
  Sunday: 0,
  Monday: 0,
  Tuesday: 0,
  Wednesday: 0,
  Thursday: 0,
  Friday: 0,
  Saturday: 0,
};

export const data = {
  labels: daysOfWeek,
  datasets: [
    {
      label: "Meditation 3",
      data: [],
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
  ],
};

export function BarChart4({ meditation3 }) {
  meditation3.forEach((item) => {
    // Extract the day of the week from the time_stamp field
    const date = new Date(item.time_stamp);
    const dayOfWeek = daysOfWeek[date.getUTCDay()];

    // Add the increment value to the total for that day of the week
    dataByDayOfWeek[dayOfWeek] += item.increment;
  });

  // Convert the dataByDayOfWeek object into an array for use in the chart
  const dataArray = [];
  daysOfWeek.forEach((day) => {
    dataArray.push(dataByDayOfWeek[day]);
  });

  data.datasets[0].data = dataArray;

  return <Bar options={options} data={data} width={600} height={370} />;
}
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
          <h1>Current Show</h1>
          <h2>"Sea Friends"</h2>
          <BarChart4 meditation3={meditation3} />
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
            <p>
              Find more on our instagram{" "}
              <a href="https://www.instagram.com/zxygallery/">
                <a>@zxygallery </a>
              </a>{" "}
            </p>
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