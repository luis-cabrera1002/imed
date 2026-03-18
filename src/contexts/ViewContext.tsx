import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type ViewMode = 'patient' | 'doctor' | 'pharmacy';

interface ViewContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider = ({ children }: { children: ReactNode }) => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('imed-view-mode');
    return (saved as ViewMode) || 'patient';
  });

  useEffect(() => {
    localStorage.setItem('imed-view-mode', viewMode);
  }, [viewMode]);

  return (
    <ViewContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </ViewContext.Provider>
  );
};

export const useView = () => {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
};
