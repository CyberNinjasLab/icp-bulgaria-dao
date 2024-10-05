// ui/components/Layout.js
import React from 'react';
import ThemeRegistry from '../../../utils/ThemeRegistry';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div>
      <ThemeRegistry>
        <Header />
        <main className={`pt-10 mx-auto container px-4 md:px-8`}>
          {children}
        </main>
        <Footer />
      </ThemeRegistry>
    </div>
  );
}
