import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { getDataFromDB } from '../../components/Search3';

export default function MeditationPage({ meditation3 }) {
    const [meditationData, setMeditationData] = useState(meditation3);
    const svgRef = useRef(null);

    const data = meditation3.map(d => ({
        ...d,
        counter_value: parseInt(d.counter_value),
        increment: parseInt(d.increment),
        date: isNaN(Date.parse(d.date)) ? d.date : new Date(d.date)
    }));


    useEffect(() => {
        if (meditationData.length > 0) {
            const svg = d3.select(svgRef.current);

            const margin = { top: 20, right: 20, bottom: 30, left: 40 };
            const width = +svg.attr('width') - margin.left - margin.right;
            const height = +svg.attr('height') - margin.top - margin.bottom;

            const x = d3.scaleBand().range([0, width]).padding(0.1);
            const y = d3.scaleLinear().range([height, 0]);

            const dataByMonth = d3.rollup(
                meditationData,
                v => d3.sum(v, d => d.counter_value),
                d => d.date.getMonth()
            );

            const percentageData = Array.from(dataByMonth, ([month, value]) => ({
                month: month + 1,
                percentage: (value / d3.sum(Array.from(dataByMonth.values()))) * 100,
            }));

            x.domain(percentageData.map(d => d.month));
            y.domain([0, d3.max(percentageData, d => d.percentage)]);

            svg
                .append('g')
                .attr('transform', `translate(${margin.left}, ${height + margin.top})`)
                .call(d3.axisBottom(x));

            svg
                .append('g')
                .attr('transform', `translate(${margin.left}, ${margin.top})`)
                .call(d3.axisLeft(y).ticks(10, '%'));

            svg
                .selectAll('.bar')
                .data(percentageData)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('x', d => x(d.month))
                .attr('y', d => y(d.percentage))
                .attr('width', x.bandwidth())
                .attr('height', d => height - y(d.percentage));

        }
    }, [meditationData]);

    return (
        <div>
            <h1>Meditation Chart</h1>
            <svg ref={svgRef} width="960" height="500"></svg>


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
