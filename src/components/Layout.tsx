import React from 'react';

import Navbar from './Navbar';
import Footer from './Footer';

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <>
      <Navbar guest={true} />
      {children}
      <Footer />
    </>
  );
}
