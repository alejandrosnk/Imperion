import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Dashboard() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="container my-4 flex-grow-1">
        <h1>Bienvenido al Dashboard</h1>
        <p>Aquí irá el contenido principal.</p>
      </main>
      <Footer />
    </div>
  );
}

export default Dashboard;
