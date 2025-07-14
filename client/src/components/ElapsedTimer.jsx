import React, { useEffect, useState } from "react";

const ElapsedTimer = ({ startDate, endDate = null }) => {
  const [now, setNow] = useState(endDate ? new Date(endDate) : new Date());

  useEffect(() => {
    if (endDate || !startDate) return;

    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate, startDate]);

  const format = (num) => String(num).padStart(2, "0");

  if (!startDate) {
    return (
      <div>
        <p>0 kun 00:00:00</p>
      </div>
    );
  }

  const start = new Date(startDate);
  const diffMs = now - start;
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(diffSeconds / (60 * 60 * 24));
  const hours = Math.floor((diffSeconds % (60 * 60 * 24)) / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;

  return (
    <div>
      <p>
        {days} kun {format(hours)}:{format(minutes)}:{format(seconds)}
      </p>
    </div>
  );
};

export default ElapsedTimer;
