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
    // console.log(data);

    useEffect(() => {
        setMeditationData(meditation3);
    }, [meditation3]);

    if (meditationData.length === 0) {
        return <div>Loading...</div>;
    }

    const monthTotals = data.reduce((acc, curr) => {
        const date = new Date(curr.date);
        const year = date.getFullYear();
        const month = date.getMonth();

        if (!acc[year]) acc[year] = {};
        if (!acc[year][month]) acc[year][month] = 0;

        acc[year][month] += curr.increment;

        return acc;
    }, {});

    const monthTotal = Object.entries(monthTotals).flatMap(([year, months]) =>
        Object.entries(months).map(([month, total]) => ({
            year: parseInt(year),
            month: parseInt(month) + 1,
            monthName: new Date(parseInt(year), parseInt(month), 1).toLocaleString('default', { month: 'long' }),
            totalIncrements: total,
        }))
    );



    return (
        <div>
            <h1>Meditation Chart</h1>
            <BarChart width={1160} height={500} data={monthTotal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={(month) => monthTotal.find((item) => item.month === month).monthName} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalIncrements" fill="#8884d8" />
            </BarChart>

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
