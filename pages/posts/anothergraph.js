import { useEffect, useState } from 'react';
import { getDataFromDB } from '../../components/Search3';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import Link from "next/link";

export default function MeditationPage({ meditation3 }) { const [meditationData1, setMeditationData1] = useState(meditation3);
    // Parse the date data to a valid format

    const parseDate = (date) => {
        const [year, month, day] = date.split("-");
        return new Date(year, month - 1, day);
    };

    const data = meditation3.map((d) => ({
        ...d,
        counter_value: parseInt(d.counter_value),
        time: parseInt(d.time), // changed time_stamp to time
        increment: parseInt(d.increment),
        date: isNaN(Date.parse(d.date)) ? parseDate(d.date) : new Date(d.date),
    }));

    useEffect(() => {
        setMeditationData1(meditation3);
    }, [meditation3]);



    if (meditationData1.length === 0) {
        return <div>Loading...</div>;
    }

// Initialize hourCounts with all keys from 0 to 23 and zero values
    const hourCounts = Array.from({length: 24}, (_, i) => i).reduce((acc, hour) => {
        acc[hour] = 0;
        return acc;
    }, {});

// Update hourCounts with the actual counts from the data
    data.forEach(({ time }) => {
        // Use the time data as the key for the hourCounts object
        const hour = time;

        // Increment the count for the hour
        hourCounts[hour]++;
    });

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
    <Link href="/">Back to home</Link>
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