import { useEffect, useState } from 'react';
import { getDataFromDB } from '../../components/Search3';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MeditationPage({ meditation3 }) {
    const [meditationData, setMeditationData] = useState(meditation3);

    const data = meditation3.map((d) => ({
        ...d,
        counter_value: parseInt(d.counter_value),
        increment: parseInt(d.increment),
        date: isNaN(Date.parse(d.date)) ? d.date : new Date(`${d.date} 2023`),
    }));

    useEffect(() => {
        setMeditationData(meditation3);
    }, [meditation3]);

    if (meditationData.length === 0) {
        return <div>Loading...</div>;
    }

    const dataByMonth = data.reduce((acc, curr) => {
        const month = curr.date.getMonth() + 1;
        const value = parseInt(curr.counter_value) - parseInt(curr.increment);
        acc[month] = acc[month] ? acc[month] + value : value;
        return acc;
    }, {});

    const increaseData = Object.keys(dataByMonth).map((month) => ({
        month: parseInt(month),
        increase: dataByMonth[month],
    }));


    return (
        <div>
            <h1>Meditation Chart</h1>
            <ResponsiveContainer width="100%" height={500}>
                <BarChart data={increaseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="increase" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
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
