import Navbar from "../components/Navbar";

const ClientLayout = () => {
    return (
        <>
            <div>
                <Navbar />
            </div>
            <main>
                <h2 className="bg-blue-300">Client Dashboard</h2>
            </main>
            <footer>
                <p>Client Footer</p>
            </footer>
        </>
    );
}
export default ClientLayout;