import React, { createContext, useContext, useState } from 'react';

interface CompanyContextType {
  companyInfo: string;
  setCompanyInfo: (info: string) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [companyInfo, setCompanyInfo] = useState('');

  return (
    <CompanyContext.Provider value={{ companyInfo, setCompanyInfo }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}