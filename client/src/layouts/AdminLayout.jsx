import Navbar from "../components/Navbar";

const AdminLayout = () => {
    return (
        <>
            <div>
                <Navbar />
            </div>
            <main>
                <h2>Admin Dashboard</h2>
                {/* Add your admin dashboard components here */}
            </main>
            <footer>
                <p>Admin Footer</p>
            </footer>
        </>
    );
}
export default AdminLayout;