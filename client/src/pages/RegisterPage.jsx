import { Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import Navbar from '../components/Navbar';

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <AuthForm mode="register" />
      <p style={{ textAlign: 'center' }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </>
  );
}
