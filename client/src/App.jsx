import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Login from "./pages/login";
import { useState } from "react";
import InternalRoutes from "./routes/Internal.Routes.jsx";


const App = () => {
  const [user, setUser] = useState({
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'manager' // This is the key property that determines the layout
  });


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header>
        <Navbar user={user} />
      </header>

      <main className="flex-grow">
        {!user ? (
          <Login setUser={setUser} />
        ) : (
          <InternalRoutes userRole={user.role} />
        )}
      </main>


      {/* Footer - positioned at bottom */}
      <footer className="bg-gray-100">
        <Footer />
      </footer>
    </div>
  );
}

export default App;
