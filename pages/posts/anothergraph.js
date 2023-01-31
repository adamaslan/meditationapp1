import Link from "next/link";
import Head from "next/head";
import Layout from "../../components/layout";
import Image from "next/image";

export default function CurrentShows() {
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
