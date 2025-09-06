import React from 'react';
import { LayoutGrid, MessageSquare } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Chatbot } from './components/Chatbot';
import { WelcomeModal } from './components/WelcomeModal';
import { CompanyProvider, useCompany } from './context/CompanyContext';
import { LoadingState } from './components/LoadingState';

function AppContent() {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'chat'>('dashboard');
  const { companyInfo, setCompanyInfo } = useCompany();
  const [showModal, setShowModal] = React.useState(!companyInfo);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleCompanySubmit = async (info: string) => {
    setIsLoading(true);
    setCompanyInfo(info);
    setShowModal(false);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const renderContent = () => {
    if (!companyInfo) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">Please enter your company information to view the dashboard.</p>
        </div>
      );
    }

    if (isLoading) {
      return <LoadingState />;
    }

    return activeTab === 'dashboard' ? <Dashboard /> : <Chatbot />;
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Social Scope</h1>
                {companyInfo && (
                  <p className="text-sm text-gray-600 mt-1">{companyInfo}</p>
                )}
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  disabled={!companyInfo || isLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    !companyInfo || isLoading
                      ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                      : activeTab === 'dashboard'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  disabled={!companyInfo || isLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    !companyInfo || isLoading
                      ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                      : activeTab === 'chat'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  Senti-GPT
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </main>
      </div>
      
      <WelcomeModal isOpen={showModal} onSubmit={handleCompanySubmit} />
    </>
  );
}

function App() {
  return (
    <CompanyProvider>
      <AppContent />
    </CompanyProvider>
  );
}

export default App;