import { useEffect, useState } from 'react';
import { getDataFromDB } from '../../components/Search3';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import Link from "next/link";

export default function MeditationPage({ meditation3 }) { const [meditationData1, setMeditationData1] = useState(meditation3);

    const data = meditation3.map((d) => ({
        ...d,
        counter_value: parseInt(d.counter_value),
        time: parseInt(d.time), // changed time_stamp to time
        increment: parseInt(d.increment),
        date: isNaN(Date.parse(d.date)) ? d.date : new Date(d.date),
    }));

    useEffect(() => {
        setMeditationData1(meditation3);
    }, [meditation3]);



    if (meditationData1.length === 0) {
        return <div>Loading...</div>;
    }



    const hourCounts = data.reduce((acc, { time }) => { // changed time_stamp to time
        const hour = new Date(time).getHours(); // changed time_stamp to time

        // Increment the count for the hour
        acc[hour] = (acc[hour] || 0) + 1;

        return acc;
    }, {});

// Prepare data for the bar chart
    const chartData = Object.keys(hourCounts).map(hour => ({
        hour: hour,
        count: hourCounts[hour]
    }));

    return (
        <BarChart width={600} height={400} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
    );
};

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