import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <>
      <Navbar />
      <div className="not-found">
        <h1 className="not-found__code">404</h1>
        <p className="not-found__msg">Page not found.</p>
        <Link className="not-found__link" to="/">Go to Home</Link>
      </div>
    </>
  );
}
