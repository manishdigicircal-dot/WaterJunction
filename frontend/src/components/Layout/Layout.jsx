import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Marquee from '../Marquee';
import CategoryGrid from '../CategoryGrid';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Marquee />
      <Navbar />
      <CategoryGrid />
      <main className="flex-grow m-0 p-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;


import Footer from './Footer';
import Marquee from '../Marquee';
import CategoryGrid from '../CategoryGrid';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Marquee />
      <Navbar />
      <CategoryGrid />
      <main className="flex-grow m-0 p-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

