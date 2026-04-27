import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './login';
import { AuthProvider } from './context/authContext';
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<LoginScreen />} />
          <Route path='*' element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>

  )
}

export default App
