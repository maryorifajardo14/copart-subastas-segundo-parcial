import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AuctionDetail from './pages/AuctionDetail';
import PublishVehicle from './pages/PublishVehicle';
import MyListings from './pages/MyListings';
import EditVehicle from './pages/EditVehicle';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/iniciar-sesion" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/subastas/:id" element={<AuctionDetail />} />
          <Route path="/publicar" element={<ProtectedRoute><PublishVehicle /></ProtectedRoute>} />
          <Route path="/mis-publicaciones" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
          <Route path="/editar/:id" element={<ProtectedRoute><EditVehicle /></ProtectedRoute>} />
          <Route path="*" element={<div className="pagina"><p className="mensaje">Página no encontrada.</p></div>} />
        </Routes>
      </main>
    </>
  );
}
