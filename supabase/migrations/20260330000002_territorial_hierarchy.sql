-- Territorial hierarchy for República Dominicana

CREATE TABLE IF NOT EXISTS regiones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  codigo TEXT NOT NULL UNIQUE,
  geom GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS provincias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  codigo TEXT NOT NULL UNIQUE,
  region_id UUID REFERENCES regiones(id),
  geom GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS municipios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  codigo TEXT NOT NULL UNIQUE,
  provincia_id UUID REFERENCES provincias(id),
  geom GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS distritos_municipales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  codigo TEXT NOT NULL UNIQUE,
  municipio_id UUID REFERENCES municipios(id),
  geom GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS secciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  codigo TEXT NOT NULL UNIQUE,
  distrito_id UUID REFERENCES distritos_municipales(id),
  geom GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recintos_electorales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  codigo TEXT NOT NULL UNIQUE,
  seccion_id UUID REFERENCES secciones(id),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  geom GEOMETRY(Point, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS colegios_electorales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recinto_id UUID REFERENCES recintos_electorales(id),
  numero INTEGER NOT NULL,
  capacidad_votantes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE circunscripcion_tipo AS ENUM ('senatorial', 'diputados', 'municipal');

CREATE TABLE IF NOT EXISTS circunscripciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  tipo circunscripcion_tipo NOT NULL,
  geom GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
