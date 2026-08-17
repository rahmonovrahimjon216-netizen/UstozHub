import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const PageContainer = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(v => !v)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-5 lg:p-8 2xl:p-10 max-w-[1920px] mx-auto w-full animate-fade-in space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageContainer;
