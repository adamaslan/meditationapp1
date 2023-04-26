import { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { prisma } from '../../db/prisma';
import { getDataFromDB } from "../../components/Search3";

export default function Chart({ meditationData }) {
    const chartRef = useRef(null);

    const labels = meditationData.map((meditation) => meditation.date);
    const data = meditationData.map((meditation) => meditation.counter_value);

    const options = {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    callback: (value) => `${value} min`,
                },
            }],
        },
    };

    const chartData = {
        labels,
        datasets: [{
            label: 'Meditation Duration',
            data,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
        }],
    };

    useEffect(() => {
        if (chartRef.current) {
            const canvas = chartRef.current.chartInstance.canvas;
            const chartInstance = chartRef.current.chartInstance;

            chartInstance.destroy();

            const newChartInstance = new Chart(canvas, {
                type: 'bar',
                data: chartData,
                options: options,
            });

            chartRef.current.chartInstance = newChartInstance;
        }
    }, [meditationData]);

    return (
        <div>
            <h1>Meditation Duration Chart</h1>
            <Bar ref={chartRef} data={chartData} options={options} />
        </div>
    );
}

export async function getServerSideProps() {
    const meditationData = await getDataFromDB();

    const cleanResult = meditationData.map((data) => ({
        date: data.date.toString(),
        counter_value: data.counter_value.toString(),
    }));

    return {
        props: {
            meditationData: JSON.parse(JSON.stringify(cleanResult)),
        },
    };
}
