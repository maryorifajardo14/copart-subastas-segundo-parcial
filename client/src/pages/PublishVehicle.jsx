import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import VehicleForm, { valoresIniciales } from '../components/VehicleForm';

export default function PublishVehicle() {
  const navigate = useNavigate();

  async function onSubmit(payload) {
    const data = await api.publicarVehiculo(payload);
    navigate(`/subastas/${data.subasta_id}`);
  }

  return (
    <div className="pagina">
      <h1>Publicar vehículo para subasta</h1>
      <p className="pagina__subtitulo">Completa la ficha técnica, la galería de fotos y los parámetros de la subasta.</p>
      <VehicleForm inicial={valoresIniciales()} onSubmit={onSubmit} textoBoton="Publicar vehículo" />
    </div>
  );
}
