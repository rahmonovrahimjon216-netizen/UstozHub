import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import Classes from './pages/Classes';
import ClassDetails from './pages/ClassDetails';
import Attendance from './pages/Attendance';
import Grades from './pages/Grades';
import Homework from './pages/Homework';
import Schedule from './pages/Schedule';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

import { initializeMockData } from './services/mockData';

const App = () => {
  useEffect(() => {
    initializeMockData();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Dashboard Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/students" element={<Students />} />
              <Route path="/students/:id" element={<StudentDetails />} />

              <Route path="/classes" element={<Classes />} />
              <Route path="/classes/:id" element={<ClassDetails />} />

              <Route path="/attendance" element={<Attendance />} />
              <Route path="/grades" element={<Grades />} />
              <Route path="/homework" element={<Homework />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Default Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
