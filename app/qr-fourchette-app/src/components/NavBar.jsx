import React from 'react';

export default function NavBar() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const onLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/'; // Redirect to home page after logout
  };

  return (
    <nav className="flex justify-between items-center w-full p-4 bg-white shadow-md">
      <span className="font-bold text-xl">MyApp</span>
      <div className="flex space-x-4">
        {!user ? (
          <>
            <button
              onClick={() => window.setIsLogin(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Login
            </button>
            <button
              onClick={() => window.setIsLogin(false)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Sign Up
            </button>
          </>
        ) : (
          <>
            <span className="mr-4">Welcome, {user.username}!</span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
