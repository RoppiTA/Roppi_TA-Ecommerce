import { useState, useRef, useEffect } from 'react';
import { Camera, Plus, Tag, Trash2, X } from 'lucide-react';
import { useCategoriaOptions, getColorHex } from '../../hooks/useCategoriaOptions';
import { CreateProductGenericoDTO } from '../../types/producto/productoGen.types';

const blockNonInteger = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
};
const blockNonDecimal = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
};

interface MaterialForm {
  id: number;
  nombre: string;
  costoExtra: string;
}

interface TallaForm {
  id: number;
  nombre: string;
  ancho: string;
  alto: string;
}

interface PersonalizacionForm {
  id: number;
  nombre: string;
  habilitado: boolean;
  costoExtra: string;
}

interface FormErrors {
  thumbnail?: string;
  nombre?: string;
  precioBase?: string;
  capacidad?: string;
  descripcion?: string;
  materiales?: string;
  tallas?: string;
  colores?: string;
  personalizaciones?: string;
}

interface CategoryFormProps {
  onClose?: () => void;
  onSave?: (dto: CreateProductGenericoDTO) => void;
}

const labelCls = 'block text-[10px] font-bold uppercase tracking-wide text-brand-muted mb-1';
const inputCls = 'w-full px-2 py-1.5 bg-brand-light/40 border border-primary2/30 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary2/40';
const selectCls = 'flex-1 px-2 py-1 border border-primary2/30 rounded text-xs focus:outline-none min-w-0 bg-white';

export function CategoryForm({ onClose, onSave }: CategoryFormProps) {
  const { colores, materiales, tamanos, personalizaciones, loading, error } =
    useCategoriaOptions();

  const [thumbnail, setThumbnail]             = useState<string | null>(null);
  const [imageName, setImageName]             = useState('');
  const [nombre, setNombre]                   = useState('');
  const [precioBase, setPrecioBase]           = useState('');
  const [capacidad, setCapacidad]             = useState('');
  const [descripcion, setDescripcion]         = useState('');
  const [errors, setErrors]                   = useState<FormErrors>({});
  const [showColorModal, setShowColorModal]   = useState(false);
  const [pendingRemoveColorId, setPendingRemoveColorId] = useState<number | null>(null);
  const [materialesForm, setMaterialesForm]   = useState<MaterialForm[]>([]);
  const [tallasForm, setTallasForm]           = useState<TallaForm[]>([]);
  const [selectedColorIds, setSelectedColorIds] = useState<Set<number>>(new Set());
  const [personalizacionesForm, setPersonalizacionesForm] = useState<PersonalizacionForm[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (personalizaciones.length > 0 && personalizacionesForm.length === 0) {
      setPersonalizacionesForm(
        personalizaciones.map(p => ({
          id: p.id,
          nombre: p.nombre,
          habilitado: false,
          costoExtra: '0.00',
        }))
      );
    }
  }, [personalizaciones, personalizacionesForm.length]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(URL.createObjectURL(file));
      setImageName(file.name);
      if (errors.thumbnail) setErrors(prev => ({ ...prev, thumbnail: undefined }));
    }
  };

  // Materiales
  const materialesNoAgregados = materiales.filter(
    m => !materialesForm.some(f => f.id === m.id)
  );
  const handleAddMaterial = (rawId: string) => {
    const mat = materiales.find(m => m.id === Number(rawId));
    if (!mat) return;
    setMaterialesForm(f => [...f, { id: mat.id, nombre: mat.nombre, costoExtra: '0.00' }]);
    if (errors.materiales) setErrors(prev => ({ ...prev, materiales: undefined }));
  };
  const removeMaterial = (id: number) =>
    setMaterialesForm(f => f.filter(m => m.id !== id));
  const updateMaterialCosto = (id: number, value: string) => {
    if (value !== '' && Number(value) < 0) return;
    setMaterialesForm(f => f.map(m => m.id === id ? { ...m, costoExtra: value } : m));
  };

  // Tallas
  const tamanosNoConfigurados = tamanos.filter(
    t => !tallasForm.some(f => f.id === t.id)
  );
  const handleAddTalla = (rawId: string) => {
    const t = tamanos.find(t => t.id === Number(rawId));
    if (!t) return;
    setTallasForm(f => [...f, { id: t.id, nombre: t.nombre, ancho: '', alto: '' }]);
    if (errors.tallas) setErrors(prev => ({ ...prev, tallas: undefined }));
  };
  const removeTalla = (id: number) =>
    setTallasForm(f => f.filter(t => t.id !== id));
  const updateTalla = (id: number, field: 'ancho' | 'alto', value: string) => {
    if (value !== '' && Number(value) < 0) return;
    setTallasForm(f => f.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  // Colores
  const toggleColor = (id: number) => {
    const isAdding = !selectedColorIds.has(id);
    setSelectedColorIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    if (isAdding && errors.colores) setErrors(prev => ({ ...prev, colores: undefined }));
  };

  // Personalizaciones
  const togglePersonalizacion = (id: number) => {
    const current = personalizacionesForm.find(p => p.id === id);
    setPersonalizacionesForm(f =>
      f.map(p => p.id === id ? { ...p, habilitado: !p.habilitado } : p)
    );
    if (current && !current.habilitado && errors.personalizaciones)
      setErrors(prev => ({ ...prev, personalizaciones: undefined }));
  };
  const updatePersonalizacionCosto = (id: number, value: string) => {
    if (value !== '' && Number(value) < 0) return;
    setPersonalizacionesForm(f => f.map(p => p.id === id ? { ...p, costoExtra: value } : p));
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    if (!thumbnail)                                     newErrors.thumbnail        = 'Debe completar este campo';
    if (!nombre.trim())                                 newErrors.nombre           = 'Debe completar este campo';
    if (!precioBase.trim())                             newErrors.precioBase       = 'Debe completar este campo';
    if (!capacidad.trim())                              newErrors.capacidad        = 'Debe completar este campo';
    if (!descripcion.trim())                            newErrors.descripcion      = 'Debe completar este campo';
    if (materialesForm.length === 0)                    newErrors.materiales       = 'Debe agregar al menos un material';
    if (tallasForm.length === 0)                        newErrors.tallas           = 'Debe agregar al menos una talla';
    if (selectedColorIds.size === 0)                    newErrors.colores          = 'Debe seleccionar al menos un color';
    if (!personalizacionesForm.some(p => p.habilitado)) newErrors.personalizaciones = 'Debe habilitar al menos un tipo de personalización';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    onSave?.({
      nombre,
      descripcion,
      precio_base: Number(precioBase),
      activo: 1,
      maximo_stock: Number(capacidad),
      imagen: imageName,
      colores: Array.from(selectedColorIds).map(id => ({ id })),
      materiales: materialesForm.map(m => ({ id: m.id, costo_extra: Number(m.costoExtra) })),
      tamanos: tallasForm.map(t => ({ id: t.id, ancho: Number(t.ancho), alto: Number(t.alto) })),
      personalizaciones: personalizacionesForm
        .filter(p => p.habilitado)
        .map(p => ({ id: p.id, costo_extra: Number(p.costoExtra) })),
    });
  };

  return (
    <div className="bg-white rounded-lg border border-primary-hover/20 overflow-hidden">
      {/* ── Header ── */}
      <div className="bg-primary-hover p-4 relative">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
        <div className="flex items-center gap-3 mb-1">
          <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
            <Tag size={16} className="text-white" />
          </div>
          <h3 className="font-bold text-lg text-white">Agregar Nuevo Producto</h3>
        </div>
        <p className="text-xs text-white/70">
          Configure las especificaciones maestras para este nuevo segmento de mercado.
        </p>
      </div>

      {/* ── Cuerpo ── */}
      <div className="p-4">
        {error && (
          <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-3">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-[5fr_7fr] gap-4">

            {/* ── Columna izquierda ── */}
            <div className="space-y-3 min-w-0">

              {/* Thumbnail */}
              <div>
                <p className={labelCls}>Thumbnail de categoría</p>
                <div className="relative">
                  {thumbnail && (
                    <button
                      type="button"
                      onClick={() => setThumbnail(null)}
                      className="absolute top-1.5 right-1.5 z-10 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                  <div
                    className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-brand-light/30 transition-colors ${errors.thumbnail ? 'border-brand-error' : 'border-primary2/30'}`}
                    style={{ height: 110 }}
                    onClick={() => !thumbnail && fileInputRef.current?.click()}
                  >
                    {thumbnail ? (
                      <img src={thumbnail} alt="thumbnail" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center mb-1.5">
                          <Camera size={16} className="text-primary2" />
                        </div>
                        <p className="text-[10px] font-semibold text-center leading-tight">CLICK OR DRAG TO UPLOAD</p>
                        <p className="text-[10px] text-muted-foreground text-center mt-0.5">PNG, JPG up to 2MB</p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handleThumbnailChange}
                    />
                  </div>
                </div>
                {errors.thumbnail && <p className="mt-1 text-xs text-brand-error">{errors.thumbnail}</p>}
              </div>

              {/* Nombre */}
              <div>
                <label className={labelCls}>Nombre de categoría</label>
                <input
                  type="text"
                  placeholder="e.g., Activewear Prem"
                  value={nombre}
                  onChange={e => { setNombre(e.target.value); if (errors.nombre) setErrors(prev => ({ ...prev, nombre: undefined })); }}
                  className={`w-full px-3 py-2.5 bg-brand-light/40 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary2/40 ${errors.nombre ? 'border-brand-error' : 'border-primary2/25'}`}
                />
                {errors.nombre && <p className="mt-1 text-xs text-brand-error">{errors.nombre}</p>}
              </div>

              {/* Precio base */}
              <div>
                <label className={labelCls}>Precio base</label>
                <div className={`flex items-center bg-brand-light/40 border rounded overflow-hidden ${errors.precioBase ? 'border-brand-error' : 'border-primary2/30'}`}>
                  <span className="px-2 py-1.5 bg-brand-light text-[10px] font-bold text-primary-hover border-r border-primary2/20 whitespace-nowrap">
                    S/.
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={precioBase}
                    onKeyDown={blockNonDecimal}
                    onChange={e => { const v = e.target.value; if (v !== '' && Number(v) < 0) return; setPrecioBase(v); if (errors.precioBase) setErrors(prev => ({ ...prev, precioBase: undefined })); }}
                    className="flex-1 px-2 py-1.5 text-xs focus:outline-none bg-transparent min-w-0"
                  />
                </div>
                {errors.precioBase && <p className="mt-1 text-xs text-brand-error">{errors.precioBase}</p>}
              </div>

              {/* Capacidad */}
              <div>
                <label className={labelCls}>Capacidad de producción</label>
                <div className={`flex items-center bg-brand-light/40 border rounded overflow-hidden ${errors.capacidad ? 'border-brand-error' : 'border-primary2/30'}`}>
                  <input
                    type="number"
                    placeholder="5000"
                    value={capacidad}
                    onKeyDown={blockNonInteger}
                    onChange={e => { const v = e.target.value; if (v !== '' && Number(v) < 0) return; setCapacidad(v); if (errors.capacidad) setErrors(prev => ({ ...prev, capacidad: undefined })); }}
                    className="flex-1 px-2 py-1.5 text-xs focus:outline-none bg-transparent min-w-0"
                  />
                  <span className="px-2 py-1.5 bg-brand-light text-[10px] font-bold text-primary-hover border-l border-primary2/20 whitespace-nowrap">
                    MENSUAL
                  </span>
                </div>
                {errors.capacidad && <p className="mt-1 text-xs text-brand-error">{errors.capacidad}</p>}
              </div>

              {/* Descripción */}
              <div>
                <label className={labelCls}>Descripción</label>
                <textarea
                  placeholder="Describe brevemente esta categoría..."
                  value={descripcion}
                  onChange={e => {
                    const palabras = e.target.value.trim().split(/\s+/).filter(Boolean).length;
                    if (palabras <= 100 || e.target.value.length < descripcion.length) {
                      setDescripcion(e.target.value);
                      if (errors.descripcion) setErrors(prev => ({ ...prev, descripcion: undefined }));
                    }
                  }}
                  rows={3}
                  className={`${inputCls} resize-none ${errors.descripcion ? 'border-brand-error' : ''}`}
                />
                <p className="text-[10px] text-brand-muted text-right mt-0.5">
                  {descripcion.trim() ? descripcion.trim().split(/\s+/).filter(Boolean).length : 0}/100 palabras
                </p>
                {errors.descripcion && <p className="mt-0.5 text-xs text-brand-error">{errors.descripcion}</p>}
              </div>
            </div>

            {/* ── Columna derecha ── */}
            <div className="space-y-3 min-w-0">

              {/* Materiales */}
              <div>
                <p className={labelCls}>Materiales disponibles y costos</p>
                {loading ? (
                  <p className="text-[10px] text-muted-foreground">Cargando...</p>
                ) : (
                  <div className="space-y-1.5">
                    {materialesForm.map(mat => (
                      <div key={mat.id} className="flex items-center bg-brand-light/40 border border-primary2/25 rounded px-2 py-1 gap-2 text-xs">
                        <span className="flex-1 font-medium truncate text-brand-dark">{mat.nombre}</span>
                        <span className="text-brand-muted shrink-0 text-[10px]">+S/.</span>
                        <input
                          type="number"
                          step="0.01"
                          value={mat.costoExtra}
                          onKeyDown={blockNonDecimal}
                          onChange={e => updateMaterialCosto(mat.id, e.target.value)}
                          className="w-12 text-xs focus:outline-none border-b border-primary2/30 bg-transparent"
                        />
                        <button type="button" onClick={() => removeMaterial(mat.id)} className="text-brand-muted hover:text-destructive shrink-0 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    {materialesNoAgregados.length > 0 && (
                      <select value="" onChange={e => handleAddMaterial(e.target.value)} className={selectCls}>
                        <option value="">+ Agregar material...</option>
                        {materialesNoAgregados.map(m => (
                          <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                      </select>
                    )}
                    {errors.materiales && <p className="mt-0.5 text-xs text-brand-error">{errors.materiales}</p>}
                  </div>
                )}
              </div>

              {/* Tallas */}
              <div>
                <p className={labelCls}>Gestión de tallas y dim. (cm)</p>
                {loading ? (
                  <p className="text-[10px] text-muted-foreground">Cargando...</p>
                ) : (
                  <div className="space-y-1.5">
                    {tallasForm.map(t => (
                      <div key={t.id} className="flex items-center bg-brand-light/40 border border-primary2/25 rounded px-2 py-1 gap-1.5">
                        <span className="text-[10px] font-bold shrink-0 text-brand-dark">{t.nombre}</span>
                        <span className="text-[10px] text-brand-muted uppercase shrink-0">Ancho (cm):</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={t.ancho}
                          onKeyDown={blockNonDecimal}
                          onChange={e => updateTalla(t.id, 'ancho', e.target.value)}
                          className="w-0 flex-1 min-w-0 text-xs border-b border-primary2/30 focus:outline-none bg-transparent"
                        />
                        <span className="text-[10px] text-brand-muted uppercase shrink-0">Alto (cm):</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={t.alto}
                          onKeyDown={blockNonDecimal}
                          onChange={e => updateTalla(t.id, 'alto', e.target.value)}
                          className="w-0 flex-1 min-w-0 text-xs border-b border-primary2/30 focus:outline-none bg-transparent"
                        />
                        <button type="button" onClick={() => removeTalla(t.id)} className="ml-auto shrink-0 text-brand-muted hover:text-destructive transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    {tamanosNoConfigurados.length > 0 && (
                      <select value="" onChange={e => handleAddTalla(e.target.value)} className={selectCls}>
                        <option value="">+ Agregar talla...</option>
                        {tamanosNoConfigurados.map(t => (
                          <option key={t.id} value={t.id}>{t.nombre}</option>
                        ))}
                      </select>
                    )}
                    {errors.tallas && <p className="mt-0.5 text-xs text-brand-error">{errors.tallas}</p>}
                  </div>
                )}
              </div>

              {/* Colores */}
              <div>
                <p className={labelCls}>Paleta de colores</p>
                {loading ? (
                  <p className="text-[10px] text-muted-foreground">Cargando...</p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {colores
                        .filter(c => selectedColorIds.has(c.id))
                        .map(c => {
                          const isPending = pendingRemoveColorId === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              title={c.nombre}
                              onClick={() => {
                                if (isPending) {
                                  toggleColor(c.id);
                                  setPendingRemoveColorId(null);
                                } else {
                                  setPendingRemoveColorId(c.id);
                                }
                              }}
                              className="relative w-6 h-6 rounded-full border-2 border-primary2 overflow-hidden transition-all"
                              style={{ backgroundColor: getColorHex(c) }}
                            >
                              {isPending && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <Trash2 size={10} className="text-white" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      <button
                        type="button"
                        onClick={() => { setShowColorModal(true); setPendingRemoveColorId(null); }}
                        className="w-6 h-6 rounded-full border-2 border-dashed border-primary2/40 flex items-center justify-center hover:bg-brand-light/50 text-primary2 transition-colors"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                    {errors.colores && <p className="mt-1 text-xs text-brand-error">{errors.colores}</p>}
                  </>
                )}
              </div>

              {/* Tipos de personalización */}
              <div>
                <p className={labelCls}>Tipos de personalización y costos</p>
                {loading ? (
                  <p className="text-[10px] text-muted-foreground">Cargando...</p>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      {personalizacionesForm.map(p => (
                        <div key={p.id} className="flex items-center bg-brand-light/40 border border-primary2/25 rounded px-2 py-1.5 gap-2">
                          <input
                            type="checkbox"
                            checked={p.habilitado}
                            onChange={() => togglePersonalizacion(p.id)}
                            className="w-3.5 h-3.5 shrink-0 accent-[#409FA8]"
                          />
                          <span className="flex-1 text-xs font-medium truncate text-brand-dark">{p.nombre}</span>
                          <span className="text-[10px] text-brand-muted uppercase shrink-0">Costo:</span>
                          <div className="flex items-center border border-primary2/25 rounded px-1.5 py-0.5">
                            <span className="text-[10px] text-brand-muted mr-0.5">S/.</span>
                            <input
                              type="number"
                              step="0.01"
                              value={p.costoExtra}
                              onKeyDown={blockNonDecimal}
                              onChange={e => updatePersonalizacionCosto(p.id, e.target.value)}
                              disabled={!p.habilitado}
                              className="w-12 text-xs focus:outline-none bg-transparent disabled:text-muted-foreground"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.personalizaciones && <p className="mt-1 text-xs text-brand-error">{errors.personalizaciones}</p>}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="px-5 py-2 bg-primary-hover text-white rounded-lg text-sm font-semibold hover:bg-primary2 transition-colors"
            >
              Guardar Categoría
            </button>
          </div>
        </form>

        {/* Modal de selección de colores */}
        {showColorModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setShowColorModal(false)}
          >
            <div
              className="bg-white rounded-lg border border-primary-hover/20 shadow-xl w-64 p-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-primary-hover/15">
                <h4 className="text-sm font-semibold text-brand-dark">Seleccionar colores</h4>
                <button
                  type="button"
                  onClick={() => setShowColorModal(false)}
                  className="text-brand-muted hover:text-brand-dark transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-1 max-h-56 overflow-y-auto">
                {colores.map(c => {
                  const selected = selectedColorIds.has(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleColor(c.id)}
                      className={`w-full flex items-center gap-3 px-2 py-1.5 rounded text-left transition-colors ${
                        selected ? 'bg-primary2/10' : 'hover:bg-brand-light/50'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full border border-primary2/30 shrink-0"
                        style={{ backgroundColor: getColorHex(c) }}
                      />
                      <span className="text-xs flex-1 text-brand-dark">{c.nombre}</span>
                      <span className={`text-xs font-bold transition-opacity ${selected ? 'text-primary2 opacity-100' : 'opacity-0'}`}>
                        ✓
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setShowColorModal(false)}
                className="mt-3 w-full py-1.5 bg-primary-hover text-white rounded text-xs font-semibold hover:bg-primary2 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
