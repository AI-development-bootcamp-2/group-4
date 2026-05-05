import { Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import Navbar from '../components/Navbar';

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <AuthForm mode="login" />
      <p style={{ textAlign: 'center' }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </>
  );
}
