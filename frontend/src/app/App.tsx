import { useState } from "react";
import { Dashboard } from './components/Dashboard';
import Login from "./components/Login";
import Register from "./components/Register";

export default function App() {
  const [screen, setScreen] = useState("login");
  return (
    <div style={{ backgroundColor: '#F6F4FB', minHeight: '100vh', color: '#2F2840' }}>
      
      {screen === "login" && (
        <Login
          onLogin={() => setScreen("dashboard")}
          goToRegister={() => setScreen("register")}
        />
      )}

      {screen === "register" && (
        <Register
          onRegister={() => setScreen("dashboard")}
          goToLogin={() => setScreen("login")}
        />
      )}

      {screen === "dashboard" && <Dashboard />}



    </div>
  );
}


