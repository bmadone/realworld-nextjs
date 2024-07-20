import { User } from '@/api/types';
import Layout from '@/components/Layout';
import { UserProvider } from '@/contexts/UserContext';
import '@/styles/globals.css';
import type { AppContext, AppProps } from 'next/app';
import cookie from 'cookie';

interface MyAppProps extends AppProps {
  initialUser: User | null;
}

export default function App({ Component, pageProps, initialUser }: MyAppProps) {
  return (
    <UserProvider initialUser={initialUser}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </UserProvider>
  );
}

App.getInitialProps = async ({ ctx }: AppContext) => {
  const { req } = ctx;
  let initialUser = null;

  if (req) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.auth_token || null;

    if (token) {
      try {
        const res = await fetch('https://api.realworld.io/api/user', {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          initialUser = data.user;
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    }
  }

  return { initialUser };
};
