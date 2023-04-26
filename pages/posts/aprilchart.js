
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

import { useEffect, useRef } from "react";
import { getDataFromDB } from "../../components/Search3";
import * as d3 from "d3";

export default function About({ meditation3 }) {
  if (meditation3.time_stamp) {
    console.log("dog-cat");
  }

  // extract data for a specific month (e.g. April)
  const monthData = meditation3.filter((data) => {
    const date = new Date(data.time_stamp);
    return date.getMonth() === 3; // April is the fourth month (zero-indexed)
  });

  // calculate total counter values for the month
  const counterTotal = monthData.reduce((acc, data) => {
    return acc + data.counter_value;
  }, 0);

  const data = {
    labels: ["April"],
    datasets: [
      {
        label: "Counter Total",
        backgroundColor: "rgba(75,192,192,1)",
        borderColor: "rgba(0,0,0,1)",
        borderWidth: 2,
        data: [counterTotal],
      },
    ],
  };

  const chartRef = useRef(null);

  useEffect(() => {
    // define chart dimensions and margins
    const margin = { top: 10, right: 30, bottom: 30, left: 60 };
    const width = 400 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // create the SVG container and set its dimensions
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // define the x and y scales
    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);

    // set the domains for the x and y scales
    x.domain(data.labels);
    y.domain([0, d3.max(data.datasets[0].data)]);

    // create the x and y axes
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(y));

    // add the bars to the chart
    svg
      .selectAll("rect")
      .data(data.datasets[0].data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(data.labels[0]))
      .attr("y", (d) => y(d))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d))
      .attr("fill", data.datasets[0].backgroundColor);

    // add the chart title and legend
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 0 - margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Counter Total for April");
    svg
      .append("text")
      .attr("x", width - 24)
      .attr("y", -margin.top / 2 + 10)
      .attr("dy", "0.32em")
      .style("text-anchor", "end")
      .text(data.datasets[0].label);
  });
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

