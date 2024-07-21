// pages/404.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Custom404 = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the home page after 5 seconds
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    // Cleanup the timer
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="container text-center mt-5">
      <h1 className="lead">404 - Page Not Found</h1>
      <p>Redirecting to the home page in 5 seconds...</p>
      <div className="spinner-border text-primary" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Custom404;
