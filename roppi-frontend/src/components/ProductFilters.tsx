import { useState } from 'react';
import { useCategoriaOptions, getColorHex } from '../hooks/useCategoriaOptions';
import { FiltrosGenericos } from '../api/productos.api';
import { Search, RotateCcw, SlidersHorizontal } from 'lucide-react';

interface ProductFiltersProps {
  onFilterChange: (filtros: FiltrosGenericos) => void;
}

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const { colores, materiales, tamanos, personalizaciones, loading, error } = useCategoriaOptions();

  // Estados locales para los filtros
  const [nombre, setNombre] = useState('');
  const [precioMin, setPrecioMin] = useState<number | ''>('');
  const [precioMax, setPrecioMax] = useState<number | ''>('');
  const [selectedColores, setSelectedColores] = useState<number[]>([]);
  const [selectedMateriales, setSelectedMateriales] = useState<number[]>([]);
  const [selectedTamanos, setSelectedTamanos] = useState<number[]>([]);
  const [selectedPersonalizaciones, setSelectedPersonalizaciones] = useState<number[]>([]);

  // Handlers para los checkboxes de selección múltiple
  const handleToggleColor = (id: number) => {
    setSelectedColores((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleMaterial = (id: number) => {
    setSelectedMateriales((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleTamano = (id: number) => {
    setSelectedTamanos((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleTogglePersonalizacion = (id: number) => {
    setSelectedPersonalizaciones((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAplicar = () => {
    const filtros: FiltrosGenericos = {};
    if (nombre.trim()) filtros.nombre = nombre.trim();
    if (precioMin !== '') filtros.precioMin = Number(precioMin);
    if (precioMax !== '') filtros.precioMax = Number(precioMax);
    if (selectedColores.length > 0) filtros.colores = selectedColores;
    if (selectedMateriales.length > 0) filtros.materiales = selectedMateriales;
    if (selectedTamanos.length > 0) filtros.tamanos = selectedTamanos;
    if (selectedPersonalizaciones.length > 0) filtros.personalizaciones = selectedPersonalizaciones;

    onFilterChange(filtros);
  };

  const handleLimpiar = () => {
    setNombre('');
    setPrecioMin('');
    setPrecioMax('');
    setSelectedColores([]);
    setSelectedMateriales([]);
    setSelectedTamanos([]);
    setSelectedPersonalizaciones([]);
    onFilterChange({});
  };

  if (loading) {
    return (
      <div className="w-64 shrink-0 bg-white rounded-lg border border-primary-hover/20 p-4 flex flex-col gap-4 animate-pulse">
        <div className="h-6 bg-brand-light/60 rounded w-2/3"></div>
        <div className="h-10 bg-brand-light/40 rounded"></div>
        <div className="h-24 bg-brand-light/40 rounded"></div>
        <div className="h-24 bg-brand-light/40 rounded"></div>
      </div>
    );
  }

  return (
    <div className="w-72 shrink-0 bg-white rounded-lg border border-primary-hover/20 p-5 flex flex-col gap-6 shadow-sm h-fit sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
      {/* Cabecera */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-light">
        <div className="flex items-center gap-2 font-semibold text-brand-dark text-base">
          <SlidersHorizontal size={18} className="text-primary-hover" />
          <span>Filtros de Búsqueda</span>
        </div>
      </div>

      {error && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded border border-amber-200">
          {error}
        </div>
      )}

      {/* Input de Búsqueda */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-brand-dark">Buscar por nombre</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Ej: Camiseta"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-primary-hover/30 rounded text-sm focus:outline-none focus:border-primary-hover"
          />
          <Search className="absolute left-2.5 top-2.5 text-brand-muted" size={16} />
        </div>
      </div>

      {/* Rango de Precios */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-brand-dark">Rango de Precios (S/)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-2.5 py-1.5 border border-primary-hover/30 rounded text-sm focus:outline-none focus:border-primary-hover"
          />
          <span className="text-brand-muted text-xs">—</span>
          <input
            type="number"
            placeholder="Max"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-2.5 py-1.5 border border-primary-hover/30 rounded text-sm focus:outline-none focus:border-primary-hover"
          />
        </div>
      </div>

      {/* Colores */}
      {colores.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-brand-dark">Colores</label>
          <div className="flex flex-wrap gap-2">
            {colores.map((color) => {
              const hex = getColorHex(color);
              const isSelected = selectedColores.includes(color.id);
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => handleToggleColor(color.id)}
                  title={color.nombre}
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${isSelected
                      ? 'border-primary-hover ring-2 ring-primary-hover/40 scale-105'
                      : 'border-brand-muted/20 hover:scale-105'
                    }`}
                  style={{ backgroundColor: hex }}
                >
                  {isSelected && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${color.nombre.toLowerCase().includes('blanco') || color.nombre.toLowerCase().includes('claro')
                          ? 'bg-black'
                          : 'bg-white'
                        }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tamaños */}
      {tamanos.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-brand-dark">Tamaños</label>
          <div className="flex flex-wrap gap-1.5">
            {tamanos.map((t) => {
              const isSelected = selectedTamanos.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleToggleTamano(t.id)}
                  className={`px-2.5 py-1 rounded text-xs font-medium border transition-all ${isSelected
                      ? 'bg-primary-hover text-white border-primary-hover'
                      : 'bg-white text-brand-dark border-primary-hover/35 hover:bg-brand-light/30'
                    }`}
                >
                  {t.nombre}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Materiales */}
      {materiales.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-brand-dark">Materiales</label>
          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
            {materiales.map((m) => {
              const isSelected = selectedMateriales.includes(m.id);
              return (
                <label key={m.id} className="flex items-center gap-2 cursor-pointer text-xs text-brand-dark select-none">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleMaterial(m.id)}
                    className="rounded border-primary-hover/35 text-primary-hover focus:ring-primary-hover/40"
                  />
                  <span>{m.nombre}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Personalizaciones */}
      {personalizaciones.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-brand-dark">Personalización</label>
          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
            {personalizaciones.map((p) => {
              const isSelected = selectedPersonalizaciones.includes(p.id);
              return (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer text-xs text-brand-dark select-none">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleTogglePersonalizacion(p.id)}
                    className="rounded border-primary-hover/35 text-primary-hover focus:ring-primary-hover/40"
                  />
                  <span>{p.nombre}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-brand-light">
        <button
          type="button"
          onClick={handleAplicar}
          className="w-full bg-primary-hover hover:bg-primary-hover/90 text-white font-semibold py-2 px-4 rounded text-sm transition-all shadow-sm"
        >
          Aplicar Filtros
        </button>
        <button
          type="button"
          onClick={handleLimpiar}
          className="w-full flex items-center justify-center gap-2 bg-brand-light/50 hover:bg-brand-light/80 text-brand-dark font-medium py-2 px-4 rounded text-sm transition-all"
        >
          <RotateCcw size={14} />
          <span>Limpiar Filtros</span>
        </button>
      </div>
    </div>
  );
}
