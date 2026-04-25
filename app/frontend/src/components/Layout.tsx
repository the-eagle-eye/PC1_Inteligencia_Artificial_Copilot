import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { NavBar } from './NavBar';

export function Layout() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <NavBar />
      <main className="container py-4 flex-grow-1">
        <Outlet />
      </main>
      <footer className="bg-white border-top py-3 mt-auto">
        <div className="container text-center text-muted small">
          Product Manager · Clean Architecture demo
        </div>
      </footer>
      <ToastContainer position="top-right" autoClose={3000} newestOnTop />
    </div>
  );
}
