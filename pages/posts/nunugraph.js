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
        </Head>
        <h1>about the project</h1>
        <br />{" "}
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
