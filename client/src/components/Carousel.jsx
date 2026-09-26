import { useState } from 'react';

export default function Carousel({ fotos }) {
  const [indice, setIndice] = useState(0);
  if (!fotos || fotos.length === 0) return <div className="carousel carousel--vacio">Sin fotografías</div>;

  const anterior = () => setIndice((i) => (i === 0 ? fotos.length - 1 : i - 1));
  const siguiente = () => setIndice((i) => (i === fotos.length - 1 ? 0 : i + 1));

  return (
    <div className="carousel">
      <div className="carousel__main">
        <button className="carousel__nav carousel__nav--izq" onClick={anterior} aria-label="Foto anterior">‹</button>
        <img src={fotos[indice]} alt={`Fotografía ${indice + 1} del vehículo`} />
        <button className="carousel__nav carousel__nav--der" onClick={siguiente} aria-label="Foto siguiente">›</button>
      </div>
      <div className="carousel__thumbs">
        {fotos.map((f, i) => (
          <img
            key={f + i}
            src={f}
            alt={`Miniatura ${i + 1}`}
            className={i === indice ? 'carousel__thumb carousel__thumb--activa' : 'carousel__thumb'}
            onClick={() => setIndice(i)}
          />
        ))}
      </div>
    </div>
  );
}
