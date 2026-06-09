import { useState, useEffect } from 'react';
import { ProductosAPIService } from '../api/productos.api';
import { Color } from '../types/producto/color.types';
import { Material } from '../types/producto/material.types';
import { Tamano } from '../types/producto/tamano.types';
import { Personalizacion } from '../types/producto/personalizacion.types';

// ---------------------------------------------------------------------------
// Estamos usando Dummy data mientras no esté listo el backend
// Reemplazar por los datos reales una vez los endpoints de categorías estén listos.
// ---------------------------------------------------------------------------
const DUMMY_COLORES: Color[] = [
  { id: 1, nombre: 'Negro',       pantone: 'Black C',       activo: 1 },
  { id: 2, nombre: 'Blanco',      pantone: 'White',         activo: 1 },
  { id: 3, nombre: 'Azul Marino', pantone: '289 C',         activo: 1 },
  { id: 4, nombre: 'Gris Claro',  pantone: 'Cool Gray 3 C', activo: 1 },
];

const DUMMY_MATERIALES: Material[] = [
  { id: 1, nombre: 'Algodón Orgánico',    descripcion: '100% orgánico certificado',   activo: 1 },
  { id: 2, nombre: 'Poliéster Reciclado', descripcion: 'Fabricado con PET reciclado', activo: 1 },
  { id: 3, nombre: 'Bambú',               descripcion: 'Fibra natural de bambú',      activo: 1 },
  { id: 4, nombre: 'Lino',                descripcion: 'Lino de alta resistencia',    activo: 1 },
];

const DUMMY_TAMANOS: Tamano[] = [
  { id: 1, nombre: 'XS',  descripcion: 'Extra Small', activo: 1 },
  { id: 2, nombre: 'S',   descripcion: 'Small',       activo: 1 },
  { id: 3, nombre: 'M',   descripcion: 'Medium',      activo: 1 },
  { id: 4, nombre: 'L',   descripcion: 'Large',       activo: 1 },
  { id: 5, nombre: 'XL',  descripcion: 'Extra Large', activo: 1 },
  { id: 6, nombre: 'XXL', descripcion: 'Double XL',   activo: 1 },
];

const DUMMY_PERSONALIZACIONES: Personalizacion[] = [
  { id: 1, nombre: 'Bordado',             descripcion: 'Hilo bordado en relieve',   activo: 1 },
  { id: 2, nombre: 'Estampado Vinil',     descripcion: 'Transferencia por calor',   activo: 1 },
  { id: 3, nombre: 'Serigrafía',          descripcion: 'Tinta directa sobre tela',  activo: 1 },
  { id: 4, nombre: 'Sublimación Digital', descripcion: 'Impresión por sublimación', activo: 1 },
];

// ---------------------------------------------------------------------------
// Resolución de color para la UI.
// Nivel 1: código Pantone exacto.
// Nivel 2: nombre del color en español (normalizado).
// Nivel 3: gris neutro genérico.
// TODO: el backend debería devolver un campo hex directamente.
// ---------------------------------------------------------------------------
const PANTONE_HEX: Record<string, string> = {
  'Black C':       '#1a1a1a',
  'White':         '#f5f5f5',
  '289 C':         '#1e3a5f',
  'Cool Gray 3 C': '#d1d5db',
};
//cuando no hay traducción de pantone a hex, intentamos utilizar el nombre para dar un color estimado
const NOMBRE_HEX: Record<string, string> = {
  'negro':         '#1a1a1a',
  'blanco':        '#f5f5f5',
  'gris':          '#6b7280',
  'gris claro':    '#d1d5db',
  'gris oscuro':   '#374151',
  'rojo':          '#dc2626',
  'azul':          '#3b82f6',
  'azul marino':   '#1e3a5f',
  'azul claro':    '#60a5fa',
  'verde':         '#16a34a',
  'verde claro':   '#4ade80',
  'amarillo':      '#eab308',
  'naranja':       '#f97316',
  'morado':        '#7c3aed',
  'violeta':       '#8b5cf6',
  'rosa':          '#ec4899',
  'rosado':        '#f9a8d4',
  'beige':         '#d4b896',
  'cafe':          '#92400e',
  'marron':        '#78350f',
  'celeste':       '#38bdf8',
  'turquesa':      '#06b6d4',
};

export const getColorHex = (color: Color): string =>
  PANTONE_HEX[color.pantone]
  ?? NOMBRE_HEX[color.nombre.toLowerCase().trim()]
  ?? '#9ca3af';

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
interface CategoriaOptions {
  colores: Color[];
  materiales: Material[];
  tamanos: Tamano[];
  personalizaciones: Personalizacion[];
  loading: boolean;
  error: string | null;
}

export function useCategoriaOptions(): CategoriaOptions {
  const [colores, setColores]                     = useState<Color[]>([]);
  const [materiales, setMateriales]               = useState<Material[]>([]);
  const [tamanos, setTamanos]                     = useState<Tamano[]>([]);
  const [personalizaciones, setPersonalizaciones] = useState<Personalizacion[]>([]);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [c, m, t, p] = await Promise.all([
          ProductosAPIService.getColores(),
          ProductosAPIService.getMateriales(),
          ProductosAPIService.getTamano(),
          ProductosAPIService.getPersonalizaciones(),
        ]);
        setColores(c.length             ? c : DUMMY_COLORES);
        setMateriales(m.length          ? m : DUMMY_MATERIALES);
        setTamanos(t.length             ? t : DUMMY_TAMANOS);
        setPersonalizaciones(p.length   ? p : DUMMY_PERSONALIZACIONES);
        setError(null);
      } catch {
        setColores(DUMMY_COLORES);
        setMateriales(DUMMY_MATERIALES);
        setTamanos(DUMMY_TAMANOS);
        setPersonalizaciones(DUMMY_PERSONALIZACIONES);
        setError('Sin conexión al backend — mostrando datos de ejemplo');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { colores, materiales, tamanos, personalizaciones, loading, error };
}
