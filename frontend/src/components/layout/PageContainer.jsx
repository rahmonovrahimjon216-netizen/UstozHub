import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const PageContainer = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(v => !v)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageContainer;
