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
import { getDataFromDB } from "../components/Search3";

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

export function BarChart3({ meditationData }) {
  meditationData.forEach((item) => {
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

export async function getServerSideProps() {
  const meditationData = await getDataFromDB();

  return {
    props: {
      meditationData,
    },
  };
}
export async function getServerSideProps() {
  try {
    const meditationData = await getDataFromDB();
    const cleanResult = meditationData.map((meditation) => ({
      ...meditation,
      id: "abc",
    }));
    return {
      props: {
        meditationData: cleanResult,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        error: "Error occured while fetching meditation data from database.",
      },
    };
  }
}
