import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService'; // Use Service

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ phone: '', password: '', nama: '', /* ...state lain */ });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await authService.login(formData.phone, formData.password);
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await authService.register(formData);
        if (error) throw error;
        alert("Berhasil daftar, silakan login.");
        setIsLogin(true);
      }
    } catch (error) {
       // Error handling centralized or specific here
       alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ... Render Form UI (Input fields) ...
  // UI Code tetap mirip, tapi logic di atas jauh lebih sederhana
}