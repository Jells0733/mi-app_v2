import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import EmpleadoPanel from './pages/EmpleadoPanel';
import NotFound from './pages/NotFound'; // nueva página opcional
import './styles/App.css';
import { AdminRoute, EmpleadoRoute } from './components/PrivateRoute';

const App = () => (
  <AuthProvider>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
        <Route
          path="/empleado"
          element={
            <EmpleadoRoute>
              <EmpleadoPanel />
            </EmpleadoRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
