import React from "react";

export default function Meditation3({ meditation3 }) {
  return (
    <div>
      <h1>Meditation 3</h1>
      <table>
        <thead>
          <tr>
            <th>Time Stamp</th>
            <th>Date</th>
            <th>Time</th>
            <th>Counter Value</th>
            <th>Increment</th>
          </tr>
        </thead>
        {/* <tbody>
          {meditation3.map((data) => (
            <tr key={data.counter_value}>
              <td>{data.time_stamp}</td>
              <td>{data.date}</td>
              <td>{data.time}</td>
              <td>{data.counter_value}</td>
              <td>{data.increment}</td>
            </tr>
          ))}
        </tbody> */}
      </table>
    </div>
  );
}
