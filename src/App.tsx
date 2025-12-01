import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MultiViewGrid from './components/layout/MultiViewGrid';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
}

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<MultiViewGrid />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
