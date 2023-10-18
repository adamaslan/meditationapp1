import React, { useState, useEffect } from 'react';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import ReactFileReader from 'react-file-reader';
import Papa from 'papaparse';
import { DragDropFiles } from 'react-drag-drop-files';

function UploadCSV({ setData }) {
    // Create a ref for the input element
    const fileInput = React.createRef();

    const handleFiles = (files) => {
        var reader = new FileReader();
        reader.onload = function(e) {
            // Use reader.result
            const csv = reader.result;
            const parsedData = Papa.parse(csv).data;
            setData(parsedData);
        }
        reader.readAsText(files[0]);

        // Check if the input ref is null
        const inputRef = fileInput.current;
        if (inputRef) {
            // Clear the input value
            inputRef.value = '';
        }
    }

    return (
        <div>
            <h2>Upload CSV File</h2>
            <ReactFileReader handleFiles={handleFiles} fileTypes={'.csv'}>
                <button className='btn'>Upload</button>
                {/* Pass the ref to the input element */}
                <input type="file" ref={fileInput} style={{display: 'none'}} />
            </ReactFileReader>
        </div>
    );
}

function DisplayGraphByHour({ data }) {
    // Prepare data for the bar chart
    // Assuming the first row of the csv file is the header
    const chartData = data.slice(1).map(row => ({
        time: parseInt(row[0]), // assuming time is the first column
        increment: parseInt(row[1]) // assuming increment is the second column
    }));

    // Group data by hour
    const dataByHour = chartData.reduce((acc, curr) => {
        const hour = curr.time; // assuming time is in 24-hour format
        acc[hour] = acc[hour] ? acc[hour] + curr.increment : curr.increment;
        return acc;
    }, {});

    // Format data for the bar chart
    const hourTotals = Object.keys(dataByHour).map(hour => ({
        hour: hour,
        count: dataByHour[hour]
    }));

    return (
        <div>
            <h2>Checkins by Hour of Day</h2>
            <BarChart width={900} height={600} data={hourTotals}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
        </div>
    );
}

function DisplayGraphByDay({ data }) {
    // Prepare data for the bar chart
    // Assuming the first row of the csv file is the header
    const chartData = data.slice(1).map(row => ({
        date: new Date(row[0]), // assuming date is the first column
        increment: parseInt(row[1]) // assuming increment is the second column
    }));

    // Group data by day of week
    const dataByDayOfWeek = chartData.reduce((acc, curr) => {
        const dayOfWeek = curr.date.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
        acc[dayOfWeek] = acc[dayOfWeek] ? acc[dayOfWeek] + curr.increment : curr.increment;
        return acc;
    }, {});

    // Format data for the bar chart
    const dayOfWeekTotals = [
        { dayOfWeek: 0, dayOfWeekName: 'Sunday', total: dataByDayOfWeek[0] || 0 },
        { dayOfWeek: 1, dayOfWeekName: 'Monday', total: dataByDayOfWeek[1] || 0 },
        { dayOfWeek: 2, dayOfWeekName: 'Tuesday', total: dataByDayOfWeek[2] || 0 },
        { dayOfWeek: 3, dayOfWeekName: 'Wednesday', total: dataByDayOfWeek[3] || 0 },
        { dayOfWeek: 4, dayOfWeekName: 'Thursday', total: dataByDayOfWeek[4] || 0 },
        { dayOfWeek: 5, dayOfWeekName: 'Friday', total: dataByDayOfWeek[5] || 0 },
        { dayOfWeek: 6, dayOfWeekName: 'Saturday', total: dataByDayOfWeek[6] || 0 },
    ];

    return (
        <div>
            <h2>Checkins by Day of Week</h2>
            <BarChart width={1160} height={500} data={dayOfWeekTotals}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dayOfWeek" tickFormatter={(dayOfWeek) => dayOfWeekTotals.find((item) => item.dayOfWeek === dayOfWeek).dayOfWeekName} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
        </div>
    );
}

export default function nugraph() {
    const [data, setData] = useState([]);

    return (
        <div className="App">
            <UploadCSV setData={setData} />
           
            {data.length > 0 && (
                <>
                    <DisplayGraphByHour data={data} />
                    <DisplayGraphByDay data={data} />
                </>
            )}
        </div>
    );
}