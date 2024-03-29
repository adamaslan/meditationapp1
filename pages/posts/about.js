import Link from "next/link";
import Head from "next/head";
import Layout from "../../components/layout";

import { getDataFromDB } from "../../components/Search3";
export default function About({ meditation3 }) {
  console.table(meditation3);
  return (
    <>
      <Layout>
        <Head>
          <title>About Meditation App</title>
          <link rel="icon" href="/public/favicon.ico" />
          <meta
            name="description"
            content="An app that helps people analyzes when they are meditative the most"
          />

          <meta
            property="og:image"
            content="https://res.cloudinary.com/adamaslan/image/upload/v1666992137/ZXY%20/zxy-logo_cos9hl.jpg"
          />
        </Head>
        <h1>about the project</h1>
        <br />{" "}
        <h2>
          {" "}
          This mediation app helps people see when they are meditative the most.
          <br /> One technique is using a counter to keep track of breathing.
          currently, we recommend stating the days counter whenever you remember
          to start it. subsequently, increase the counter after every two
          outbreaths during the session. if you leave the app or get lost in
          thought or another activity, but then remember to be aware of
          breathing, increase the counter and go back to increasing the counter
          after every 2nd outbreath.
        </h2>
        <p>
          the hope is to build graphs by days of the week, times of the day, by
          month, focused periods (more than 4 counts in an hour)
        </p>
        <br />
        <br />
        <h2>
          How it was built: <br /> This website is built with Nextjs, Prisma,
          React, CSS, HTML. It is super fast via its integration with Vercel,
          which also allows for testing before deployment. It runs via github.
        </h2>
        <div>
          <h1>Meditation 4</h1>
          <table>
            <thead>
              <tr>
                <th>Time Stamp</th>
                <th>Date</th>
                <th>Time</th>
                <th>Counter Value</th>
                <th>Increment</th>
              </tr>
            </thead>
            <tbody>
              {meditation3.map((meditation4) => (
                <tr key={meditation4.counter_value}>
                  <td>{meditation4.time_stamp}</td>
                  <td>{meditation4.date}</td>
                  <td>{meditation4.time}</td>
                  <td>{meditation4.counter_value}</td>
                  <td>{meditation4.increment}</td>
                </tr>
              ))}
              This code will achieve the same result as the original code but
              without unnecessarily calling the Array.from() method.
            </tbody>
          </table>
        </div>
        <h2>
          <Link href="/">Back to home</Link>
        </h2>
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
// export const getServerSideProps = async () => {
//   const results = await getAllUsers();
//   const cleanResult = results.map((artist) => ({ ...artist, id: "abc" }));
//   return { props: { results: JSON.parse(JSON.stringify(cleanResult)) } };
// };

// export const getServerSideProps = async () => {
//   const meditation3 = await getDataFromDB();
//   const cleanResult = meditation3.map((data) => ({
//     time_stamp: data.time_stamp,
//     date: data.date,
//     time: data.time,
//     counter_value: "abc",
//     increment: data.increment,
//   }));
//   return {
//     props: {
//       meditation3: JSON.parse(JSON.stringify(cleanResult)),
//     },
//   };
// };
