type Props = {
  onRegister: () => void;
  goToLogin: () => void;
};

export default function Register({
  onRegister,
  goToLogin,
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
            Crear cuenta
          </h1>

          <p
            style={{
              color: "#9080B0",
              marginTop: "0.5rem",
            }}
          >
            Únete a FlowNote
          </p>
        </div>

        <input
          type="text"
          placeholder="Nombre"
          style={inputStyle}
        />

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
          onClick={onRegister}
          style={buttonStyle}
        >
          Crear cuenta
        </button>

        <p
          style={{
            textAlign: "center",
            color: "#9080B0",
            fontSize: "0.9rem",
          }}
        >
          ¿Ya tienes cuenta?{" "}
          <span
            onClick={goToLogin}
            style={{
              color: "#8070C8",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Inicia sesión
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