import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Requiere estar autenticado.
 */
export const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

/**
 * Requiere ser administrador.
 */
export const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user?.role === 'admin' ? children : <Navigate to="/" />;
};

/**
 * Requiere ser empleado.
 */
export const EmpleadoRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user?.role === 'empleado' ? children : <Navigate to="/" />;
};
