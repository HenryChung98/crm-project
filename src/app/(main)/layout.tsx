import React from 'react';
import NavBar from '../components/navbar/NavBar';
import ScrollToTop from '../components/ScrollToTop';
import Footer from '../components/Footer';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavBar />
      {children}
      <ScrollToTop />
      <Footer />
    </>
  );
}