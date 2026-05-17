type Props = {
  onLogin: () => void;
  goToRegister: () => void;
};

export default function Login({
  onLogin,
  goToRegister,
}: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(to bottom right, #F6F4FB, #EEE8FA)",
      }}
    >
      <div
        style={{
          width: "380px",
          backgroundColor: "#FFFFFF",
          padding: "2.5rem",
          borderRadius: "24px",
          boxShadow: "0 10px 30px rgba(128,112,200,0.15)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "2rem",
              color: "#2F2840",
            }}
          >
            FlowNote
          </h1>

          <p
            style={{
              color: "#9080B0",
              marginTop: "0.5rem",
            }}
          >
            Inicia sesión para continuar
          </p>
        </div>

        <input
          type="email"
          placeholder="Correo"
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Contraseña"
          style={inputStyle}
        />

        <button
          onClick={onLogin}
          style={buttonStyle}
        >
          Entrar
        </button>

        <p
          style={{
            textAlign: "center",
            color: "#9080B0",
            fontSize: "0.9rem",
          }}
        >
          ¿No tienes cuenta?{" "}
          <span
            onClick={goToRegister}
            style={{
              color: "#8070C8",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Regístrate
          </span>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "0.9rem 1rem",
  borderRadius: "14px",
  border: "1px solid #DDD6F3",
  fontSize: "1rem",
  outline: "none",
};

const buttonStyle = {
  padding: "1rem",
  borderRadius: "14px",
  border: "none",
  backgroundColor: "#8070C8",
  color: "white",
  fontSize: "1rem",
  cursor: "pointer",
};