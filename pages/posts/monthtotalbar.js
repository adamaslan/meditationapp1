import { Bar } from "react-chartjs-2";
import { getDataFromDB } from "../../components/Search3";

export default function About({ meditation3 }) {
  console.table(meditation3);

  // extract data for a specific month (e.g. April)
  const monthData = meditation3.filter((data) => {
    const date = new Date(data.time_stamp);
    return date.getMonth() === 3; // April is the fourth month (zero-indexed)
  });

  // calculate total counter values for the month
  const counterTotal = monthData.reduce((acc, data) => {
    return acc + data.counter_value;
  }, 0);

  const data = {
    labels: ["April"],
    datasets: [
      {
        label: "Counter Total",
        backgroundColor: "rgba(75,192,192,1)",
        borderColor: "rgba(0,0,0,1)",
        borderWidth: 2,
        data: [counterTotal],
      },
    ],
  };

  return (
    <div>
      <h1>About the Project</h1>
      <Bar
        data={data}
        options={{
          title: {
            display: true,
            text: "Counter Total for April",
            fontSize: 20,
          },
          legend: {
            display: true,
            position: "right",
          },
        }}
      />
    </div>
  );
}

export const getServerSideProps = async () => {
  const meditation3 = await getDataFromDB();
  const cleanResult = meditation3.map((data) => ({
    time_stamp: data.time_stamp.toString(),
    date: data.date,
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
