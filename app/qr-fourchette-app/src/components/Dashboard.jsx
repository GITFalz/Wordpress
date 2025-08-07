import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // <- wait before redirecting

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  if (loading) return null; // don't render anything until we check

  if (!user) {
    window.location.href = '/login'; // redirect only if confirmed not logged in
    return null;
  }

  return (
    <div className="p-6 bg-white rounded shadow-md">
    <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
    <p>Welcome, {user.username}!</p>
    <p>Email: {user.email}</p>
    </div>
  );
}
