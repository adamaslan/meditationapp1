import Head from "next/head";
import Link from "next/link";
import { BarChart3 } from "../components/BarChart3";
export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Meditation Insights</title>

        <meta
          name="description"
          content="A technology focused Art Gallery located in Bushwick, Brooklyn"
        />
        <link rel="icon" href="/public/favicon.ico" />
        <link
          rel="apple-touch-icon"
          href="https://res.cloudinary.com/adamaslan/image/upload/c_thumb,w_200,g_face/v1666992137/ZXY%20/zxy-logo_cos9hl.jpg"
        ></link>
        <meta
          property="og:image"
          content="https://res.cloudinary.com/adamaslan/image/upload/v1666992137/ZXY%20/zxy-logo_cos9hl.jpg"
        />
      </Head>

      <main>
        <h1 className="title">
          Welcome to
          <Link href="/posts/currentshow" legacyBehavior>
            <a> Meditation Land</a>
          </Link>
        </h1>

        <p className="description">
          <code>
            A new fun meditation app and event space at ZXY <br /> contact us on
            instagram for info on our latest events &nbsp;
            <a href="https://www.instagram.com/zxygallery/?hl=en">
              <u>@zxygallery</u>
            </a>{" "}
          </code>
        </p>

        <div className="grid">
          <a href="/posts/about" className="card">
            <h3>About &rarr;</h3>
            <p>More about the app and ZXY Gallery</p>
          </a>

          <a href="/posts/featuredfeature" className="card">
            <h3>Featured App Feature &rarr;</h3>
            <p>Our most fun new feature</p>
          </a>

          <a href="/posts/anothergraph" className="card">
            <h3>More Graphs &rarr;</h3>
            <p>Fun Fun Fun</p>
          </a>

          <a href="/posts/pastfeatures" className="card">
            <h3>Past Features &rarr;</h3>
            <p>Explore Past Features</p>
          </a>
        </div>
        <BarChart3 />
      </main>

      <footer>
        <p>
          Click{" "}
          <a
            href="https://online.zxygallery.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <u>here</u>
          </a>{" "}
          to check out the current highly toggleable online gallery. Thanks to
          Ellis Marte and Nick Foden for their assitance on this project.
        </p>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #f30000c0;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 600px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #f30000c0;
          border-color: #f30000c0;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .logo {
          height: 1em;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
