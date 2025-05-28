import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { AdminLayout, ClientLayout } from "./layouts";
import Login from "./pages/login";


const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header>
        <Navbar />
      </header>

      {/* Main content */}
      <main className="flex-grow">
        content
      </main>

      {/* Footer - positioned at bottom */}
      <footer className="bg-gray-100">
        <Footer />
      </footer>
    </div>
  );
}

export default App;
