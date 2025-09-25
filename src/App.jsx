import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/login-page';
import TeacherDashboard from './pages/teacher-dasboard-page';
import StudentDashboard from './pages/student-dashboard-page';
import { AuthProvider, useAuth } from './auth/auth';

function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/teacher" element={<PrivateRoute role="TEACHER"><TeacherDashboard /></PrivateRoute>} />
        <Route path="/student" element={<PrivateRoute role="STUDENT"><StudentDashboard /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
}
