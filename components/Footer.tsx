
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-brand-secondary mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-brand-text-secondary">
        <p>&copy; {new Date().getFullYear()} Crypto Briefs. All Rights Reserved.</p>
        <p className="text-sm mt-1">Powered by AI and Blockchain Dreams</p>
      </div>
    </footer>
  );
};

export default Footer;
