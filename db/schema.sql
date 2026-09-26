-- Esquema de base de datos: Plataforma de Subastas de Vehículos (Caso Copart)
-- PostgreSQL (Neon / Vercel Postgres)

DROP TABLE IF EXISTS pujas CASCADE;
DROP TABLE IF EXISTS subastas CASCADE;
DROP TABLE IF EXISTS vehiculo_fotos CASCADE;
DROP TABLE IF EXISTS vehiculos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TYPE IF EXISTS nivel_dano;
DROP TYPE IF EXISTS estado_subasta;

CREATE TYPE nivel_dano AS ENUM ('verde', 'amarillo', 'rojo');
CREATE TYPE estado_subasta AS ENUM ('pendiente', 'activa', 'cerrada_vendida', 'cerrada_desierta');

CREATE TABLE usuarios (
  id              SERIAL PRIMARY KEY,
  nombre          VARCHAR(100) NOT NULL,
  apellido        VARCHAR(100) NOT NULL,
  correo          VARCHAR(150) UNIQUE NOT NULL,
  telefono        VARCHAR(30) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vehiculos (
  id                SERIAL PRIMARY KEY,
  propietario_id    INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  anio              INTEGER NOT NULL CHECK (anio BETWEEN 1900 AND 2100),
  tipo_articulo     VARCHAR(100) NOT NULL,
  marca             VARCHAR(100) NOT NULL,
  modelo            VARCHAR(100) NOT NULL,
  motor             VARCHAR(100) NOT NULL,
  transmision       VARCHAR(50) NOT NULL,
  tipo_combustible  VARCHAR(50) NOT NULL,
  tren_manejo       VARCHAR(10) NOT NULL CHECK (tren_manejo IN ('AWD','FWD','RWD','4WD')),
  num_cilindros     INTEGER NOT NULL CHECK (num_cilindros > 0),
  nivel_dano        nivel_dano NOT NULL,
  descripcion_dano  VARCHAR(255),
  creado_en         TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vehiculo_fotos (
  id           SERIAL PRIMARY KEY,
  vehiculo_id  INTEGER NOT NULL REFERENCES vehiculos(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  orden        INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE subastas (
  id             SERIAL PRIMARY KEY,
  vehiculo_id    INTEGER NOT NULL UNIQUE REFERENCES vehiculos(id) ON DELETE CASCADE,
  precio_base    NUMERIC(12,2) NOT NULL CHECK (precio_base >= 20000),
  precio_actual  NUMERIC(12,2) NOT NULL,
  fecha_inicio   TIMESTAMPTZ NOT NULL,
  fecha_cierre   TIMESTAMPTZ NOT NULL,
  estado         estado_subasta NOT NULL DEFAULT 'pendiente',
  ganador_id     INTEGER REFERENCES usuarios(id),
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (fecha_cierre > fecha_inicio)
);

CREATE TABLE pujas (
  id           SERIAL PRIMARY KEY,
  subasta_id   INTEGER NOT NULL REFERENCES subastas(id) ON DELETE CASCADE,
  postor_id    INTEGER NOT NULL REFERENCES usuarios(id),
  monto        NUMERIC(12,2) NOT NULL,
  creado_en    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pujas_subasta ON pujas(subasta_id);
CREATE INDEX idx_vehiculos_propietario ON vehiculos(propietario_id);
CREATE INDEX idx_vehiculos_filtros ON vehiculos(marca, modelo, anio, tipo_combustible, nivel_dano);
