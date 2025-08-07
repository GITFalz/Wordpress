import React, { useEffect, useState } from 'react';

export default function BackendStatus() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    fetch('https://shiny-pancake-jjj9j5754vwvhqp66-4000.app.github.dev/api/health')
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus('Error fetching backend status'));
  }, []);

  return <p>{status}</p>;
}