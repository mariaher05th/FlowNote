// Importa el componente Dashboard desde la carpeta de componentes
import { Dashboard } from './components/Dashboard';


// Define el componente principal de la aplicación
export default function App() {
  return (
    // Contenedor principal de la app con estilos en línea
    // backgroundColor: color de fondo
    // minHeight: altura mínima para ocupar toda la pantalla
    <div style={{ backgroundColor: '#F6F4FB', minHeight: '100vh', color: '#2F2840' }}>
      <Dashboard />
    </div>
  );
}