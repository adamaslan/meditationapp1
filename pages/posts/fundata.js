import Link from "next/link";
import Head from "next/head";
import Layout from "../../components/layout";
import { useState, useEffect } from "react";
import { getDataFromDB } from "../../components/Search3";

export function AveTime({ meditation3 }) {
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
      {Array.from(columns).map((column, index) => {
        const newColumns = Array(7)
          .fill()
          .map(() => []);

        column.forEach((element) => {
          const dayOfWeek = new Date(element.time_stamp).getDay();
          newColumns[dayOfWeek].push(element);
        });

        const timestamps = newColumns[index].map((element) =>
          new Date(element.time_stamp).getTime()
        );

        const totalTimestamps = timestamps.reduce(
          (total, timestamp) => total + timestamp,
          0
        );
        const averageTimestamp = new Date(totalTimestamps / timestamps.length);
        const options = { timeZone: "America/New_York" };
        const formattedTime = averageTimestamp.toLocaleTimeString(
          "en-US",
          options
        );

        return (
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
            <li>{formattedTime}</li>
          </ul>
        );
      })}
    </div>
  );
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
          <h1>Most Meditative Days of the Week"</h1>
          <h2> Total number of Check-ins</h2>
          <h3>
            A check-in is defined as an attempt to become aware, mindful, in two
            words: more conscious. This is usually accompanied with
            concentration on two breaths. On the third breath, another check-in
            has been completed.{" "}
          </h3>
          <AveTime meditation3={meditation3} />
          {/* <TicksPerDay /> */}

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
    counter_value: data.counter_value.toString(),
    increment: data.increment.toString(),
  }));
  return {
    props: {
      meditation3: JSON.parse(JSON.stringify(cleanResult)),
    },
  };
};
