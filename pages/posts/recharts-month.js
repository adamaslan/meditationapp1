import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getDataFromDB } from '../../components/Search3';

export default function MeditationPage({ meditation3 }) {
    const [meditationData, setMeditationData] = useState(meditation3);

    const data = meditation3.map((d) => ({
        ...d,
        counter_value: parseInt(d.counter_value),
        increment: parseInt(d.increment),
        date: isNaN(Date.parse(d.date)) ? d.date : new Date(d.date),
    }));

    useEffect(() => {
        setMeditationData(meditation3);
    }, [meditation3]);

    if (meditationData.length === 0) {
        return <div>Loading...</div>;
    }

    const dataByMonth = data.reduce((acc, curr) => {
        const month = curr.date.getMonth() + 1;
        acc[month] = acc[month] ? acc[month] + curr.counter_value : curr.counter_value;
        return acc;
    }, {});

    const percentageData = Object.keys(dataByMonth).map((month) => ({
        month: parseInt(month),
        percentage: (dataByMonth[month] / data.reduce((acc, curr) => acc + curr.counter_value, 0)) * 100,
    }));

    return (
        <div>
            <h1>Meditation Chart</h1>
            <BarChart width={960} height={500} data={percentageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="percentage" fill="#8884d8" />
            </BarChart>
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
