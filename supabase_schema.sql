-- Script para crear las tablas en Supabase
-- Ejecutar esto en el SQL Editor de Supabase (https://supabase.com/dashboard/project/_/sql)

-- 1. Tabla de Operadores (Usuarios del sistema)
CREATE TABLE IF NOT EXISTS public.operadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'operador', -- 'operador' o 'administrador'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Titulares (Personas que solicitan licencia)
CREATE TABLE IF NOT EXISTS public.titulares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dni TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    direccion TEXT NOT NULL,
    grupo_sanguineo TEXT NOT NULL,
    factor_rh TEXT NOT NULL,
    donante_organos BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Licencias
CREATE TABLE IF NOT EXISTS public.licencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titular_id UUID NOT NULL REFERENCES public.titulares(id) ON DELETE CASCADE,
    clase TEXT NOT NULL, -- Ej: A, B, C, D, E, F, G
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE NOT NULL,
    estado TEXT NOT NULL DEFAULT 'vigente', -- 'vigente', 'vencida', 'retenida'
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurar RLS (Row Level Security) - Por ahora permitimos todo para desarrollo
ALTER TABLE public.operadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.titulares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo a operadores" ON public.operadores FOR ALL USING (true);
CREATE POLICY "Permitir todo a titulares" ON public.titulares FOR ALL USING (true);
CREATE POLICY "Permitir todo a licencias" ON public.licencias FOR ALL USING (true);
