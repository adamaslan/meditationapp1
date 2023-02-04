const MeditationData = ({ meditationData }) => {
  return (
    <div>
      {meditationData.map((meditation) => (
        <div key={meditation.counter_value}>
          <p>Date: {meditation.date}</p>
          <p>Time: {meditation.time}</p>
          <p>Counter Value: {meditation.counter_value}</p>
          <p>Increment: {meditation.increment}</p>
        </div>
      ))}
    </div>
  );
};

export default MeditationData;
