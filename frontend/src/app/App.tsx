import { useState } from "react";
import { Dashboard } from './components/Dashboard';
import Login from "./components/Login";
import Register from "./components/Register";
import { ThemeProvider } from './components/context/ThemeContext';

export default function App() {
  const [screen, setScreen] = useState("login");

  return (
    <ThemeProvider>
      <div style={{ backgroundColor: 'var(--app-bg)', minHeight: '100vh', color: 'var(--app-fg)', transition: 'background-color 0.25s, color 0.25s' }}>

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
    </ThemeProvider>
  );
}