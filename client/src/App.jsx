import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { AdminLayout, ClientLayout, TeamLayout } from "./layouts";
import Login from "./pages/login";
import { useState } from "react";


const App = () => {
  const [user, setUser] = useState({
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'client' // This is the key property that determines the layout
  });

  // Function to determine which layout to render based on user role
  const renderLayoutByUserRole = () => {
    if (!user) {
      return <Login setUser={setUser} />;
    }

    switch (user.role) {
      case 'admin':
        return <AdminLayout user={user} />;
      case 'client':
        return <ClientLayout user={user} />;
      case 'manager':
      case 'support':
      case 'developer':
      case 'qa':
        return <TeamLayout user={user} />;
      default:
        return (
          <div className="container mx-auto py-10 px-4">
            <h2 className="text-2xl font-bold text-center mb-6">Welcome to the Feedback Portal</h2>
            <p className="text-center">Your user role doesn't have a specific layout assigned.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header>
        <Navbar user={user} />
      </header>

      {/* Main content with conditional rendering based on user role */}
      <main className="flex-grow">
        {renderLayoutByUserRole()}
      </main>

      {/* Footer - positioned at bottom */}
      <footer className="bg-gray-100">
        <Footer />
      </footer>
    </div>
  );
}

export default App;
