// src/components/AdminPanel/AdminPanel.js
import React, { useState, useEffect } from "react";
import Login from "./Login";
import AdminDashboard from "./AdminDashboard";
import { account } from "../../appwrite/config";
import { supabase } from "../../supabase/config";

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const loginUser = async (email, password) => {
    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log(user);

    if (user) {
      setIsLoggedIn(true);
      alert("Login Successful");
    }
    if (error) {
      console.log(error.message);
      alert(error.message);
    }
  };
  const logoutUser = async () => {
    try {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      alert("Logged out successfully!");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };
  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setAdminData(user);
        if (user) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        setIsLoggedIn(false);
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLoggedIn ? (
        <Login onLogin={loginUser} />
      ) : (
        <AdminDashboard onLogout={logoutUser} />
      )}
    </div>
  );
};

export default AdminPanel;
