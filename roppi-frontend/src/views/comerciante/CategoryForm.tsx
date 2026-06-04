import { useState, useRef, useEffect } from 'react';
import { Camera, Plus, Trash2, X } from 'lucide-react';
import { useCategoriaOptions, getColorHex } from '../../hooks/useCategoriaOptions';

// --- Tipos de estado del formulario (selecciones del usuario) ---
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

// Clases reutilizables
const labelCls = 'block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1';
const inputCls = 'w-full px-2 py-1.5 border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-ring';
const selectCls = 'flex-1 px-2 py-1 border border-border rounded text-xs focus:outline-none min-w-0 bg-white';

export function CategoryForm() {
  // --- Catálogo desde el backend (o dummy si no hay conexión) ---
  const { colores, materiales, tamanos, personalizaciones, loading, error } =
    useCategoriaOptions();

  // --- Estado del formulario (selecciones del usuario) ---
  const [thumbnail, setThumbnail]               = useState<string | null>(null);
  const [nombre, setNombre]                     = useState('');
  const [capacidad, setCapacidad]               = useState('');
  const [descripcion, setDescripcion]           = useState('');
  const [showColorModal, setShowColorModal]         = useState(false);
  const [pendingRemoveColorId, setPendingRemoveColorId] = useState<number | null>(null);
  const [materialesForm, setMaterialesForm]     = useState<MaterialForm[]>([]);
  const [tallasForm, setTallasForm]             = useState<TallaForm[]>([]);
  const [selectedColorIds, setSelectedColorIds] = useState<Set<number>>(new Set());
  const [personalizacionesForm, setPersonalizacionesForm] = useState<PersonalizacionForm[]>([]);


  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inicializar personalizaciones cuando carga el catálogo
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

  // --- Handlers ---
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setThumbnail(URL.createObjectURL(file));
  };

  // Materiales
  const materialesNoAgregados = materiales.filter(
    m => !materialesForm.some(f => f.id === m.id)
  );
  const handleAddMaterial = (rawId: string) => {
    const mat = materiales.find(m => m.id === Number(rawId));
    if (!mat) return;
    setMaterialesForm(f => [...f, { id: mat.id, nombre: mat.nombre, costoExtra: '0.00' }]);
  };
  const removeMaterial = (id: number) =>
    setMaterialesForm(f => f.filter(m => m.id !== id));
  const updateMaterialCosto = (id: number, value: string) =>
    setMaterialesForm(f => f.map(m => m.id === id ? { ...m, costoExtra: value } : m));

  // Tallas
  const tamanosNoConfigurados = tamanos.filter(
    t => !tallasForm.some(f => f.id === t.id)
  );
  const handleAddTalla = (rawId: string) => {
    const t = tamanos.find(t => t.id === Number(rawId));
    if (!t) return;
    setTallasForm(f => [...f, { id: t.id, nombre: t.nombre, ancho: '', alto: '' }]);
  };
  const removeTalla = (id: number) =>
    setTallasForm(f => f.filter(t => t.id !== id));
  const updateTalla = (id: number, field: 'ancho' | 'alto', value: string) =>
    setTallasForm(f => f.map(t => t.id === id ? { ...t, [field]: value } : t));

  // Colores
  const toggleColor = (id: number) =>
    setSelectedColorIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // Personalizaciones
  const togglePersonalizacion = (id: number) =>
    setPersonalizacionesForm(f =>
      f.map(p => p.id === id ? { ...p, habilitado: !p.habilitado } : p)
    );
  const updatePersonalizacionCosto = (id: number, value: string) =>
    setPersonalizacionesForm(f =>
      f.map(p => p.id === id ? { ...p, costoExtra: value } : p)
    );

  return (
    <div className="bg-white rounded-lg border border-border p-4 overflow-hidden">
      <h3 className="font-semibold text-sm mb-0.5">Agregar Nueva Categoría</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Configure las especificaciones maestras para este nuevo segmento de mercado.
      </p>

      {error && (
        <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-3">
          {error}
        </p>
      )}

      <form onSubmit={e => e.preventDefault()}>
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
                className="border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors"
                style={{ height: 110 }}
                onClick={() => !thumbnail && fileInputRef.current?.click()}
              >
                {thumbnail ? (
                  <img src={thumbnail} alt="thumbnail" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mb-1.5">
                      <Camera size={16} className="text-muted-foreground" />
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
            </div>

            {/* Nombre */}
            <div>
              <label className={labelCls}>Nombre de categoría</label>
              <input
                type="text"
                placeholder="e.g., Activewear Prem"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className={inputCls}
              />
            </div>

            {/* Capacidad */}
            <div>
              <label className={labelCls}>Capacidad de producción</label>
              <div className="flex items-center border border-border rounded overflow-hidden">
                <input
                  type="number"
                  placeholder="5000"
                  value={capacidad}
                  onChange={e => setCapacidad(e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs focus:outline-none bg-transparent min-w-0"
                />
                <span className="px-2 py-1.5 bg-muted text-[10px] font-bold text-muted-foreground border-l border-border whitespace-nowrap">
                  MENSUAL
                </span>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className={labelCls}>Descripción</label>
              <textarea
                placeholder="Describe brevemente esta categoría..."
                value={descripcion}
                onChange={e => {
                  const palabras = e.target.value.trim().split(/\s+/).filter(Boolean).length;
                  if (palabras <= 100 || e.target.value.length < descripcion.length)
                    setDescripcion(e.target.value);
                }}
                rows={3}
                className={`${inputCls} resize-none`}
              />
              <p className="text-[10px] text-muted-foreground text-right mt-0.5">
                {descripcion.trim() ? descripcion.trim().split(/\s+/).filter(Boolean).length : 0}/100 palabras
              </p>
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
                    <div key={mat.id} className="flex items-center border border-border rounded px-2 py-1 gap-2 text-xs">
                      <span className="flex-1 font-medium truncate">{mat.nombre}</span>
                      <span className="text-muted-foreground shrink-0 text-[10px]">+S/.</span>
                      <input
                        type="number"
                        step="0.01"
                        value={mat.costoExtra}
                        onChange={e => updateMaterialCosto(mat.id, e.target.value)}
                        className="w-12 text-xs focus:outline-none border-b border-border bg-transparent"
                      />
                      <button type="button" onClick={() => removeMaterial(mat.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {materialesNoAgregados.length > 0 && (
                    <select
                      value=""
                      onChange={e => handleAddMaterial(e.target.value)}
                      className={selectCls}
                    >
                      <option value="">+ Agregar material...</option>
                      {materialesNoAgregados.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre}</option>
                      ))}
                    </select>
                  )}
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
                    <div key={t.id} className="flex items-center border border-border rounded px-2 py-1 gap-1.5">
                      <span className="text-[10px] font-bold shrink-0">{t.nombre}</span>
                      <span className="text-[10px] text-muted-foreground uppercase shrink-0">Ancho (cm):</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={t.ancho}
                        onChange={e => updateTalla(t.id, 'ancho', e.target.value)}
                        className="w-0 flex-1 min-w-0 text-xs border-b border-border focus:outline-none bg-transparent"
                      />
                      <span className="text-[10px] text-muted-foreground uppercase shrink-0">Alto (cm):</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={t.alto}
                        onChange={e => updateTalla(t.id, 'alto', e.target.value)}
                        className="w-0 flex-1 min-w-0 text-xs border-b border-border focus:outline-none bg-transparent"
                      />
                      <button type="button" onClick={() => removeTalla(t.id)} className="ml-auto shrink-0 text-muted-foreground hover:text-destructive">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {tamanosNoConfigurados.length > 0 && (
                    <select
                      value=""
                      onChange={e => handleAddTalla(e.target.value)}
                      className={selectCls}
                    >
                      <option value="">+ Agregar talla...</option>
                      {tamanosNoConfigurados.map(t => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            {/* Colores */}
            <div>
              <p className={labelCls}>Paleta de colores</p>
              {loading ? (
                <p className="text-[10px] text-muted-foreground">Cargando...</p>
              ) : (
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
                          className="relative w-6 h-6 rounded-full border-2 border-primary overflow-hidden transition-all"
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
                    className="w-6 h-6 rounded-full border-2 border-dashed border-border flex items-center justify-center hover:bg-muted text-muted-foreground"
                  >
                    <Plus size={11} />
                  </button>
                </div>
              )}
            </div>

            {/* Tipos de personalización */}
            <div>
              <p className={labelCls}>Tipos de personalización y costos</p>
              {loading ? (
                <p className="text-[10px] text-muted-foreground">Cargando...</p>
              ) : (
                <div className="space-y-1.5">
                  {personalizacionesForm.map(p => (
                    <div key={p.id} className="flex items-center border border-border rounded px-2 py-1.5 gap-2">
                      <input
                        type="checkbox"
                        checked={p.habilitado}
                        onChange={() => togglePersonalizacion(p.id)}
                        className="w-3.5 h-3.5 accent-primary shrink-0"
                      />
                      <span className="flex-1 text-xs font-medium truncate">{p.nombre}</span>
                      <span className="text-[10px] text-muted-foreground uppercase shrink-0">Costo:</span>
                      <div className="flex items-center border border-border rounded px-1.5 py-0.5">
                        <span className="text-[10px] text-muted-foreground mr-0.5">S/.</span>
                        <input
                          type="number"
                          step="0.01"
                          value={p.costoExtra}
                          onChange={e => updatePersonalizacionCosto(p.id, e.target.value)}
                          disabled={!p.habilitado}
                          className="w-12 text-xs focus:outline-none bg-transparent disabled:text-muted-foreground"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
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
            className="bg-white rounded-lg border border-border shadow-xl w-64 p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold">Seleccionar colores</h4>
              <button
                type="button"
                onClick={() => setShowColorModal(false)}
                className="text-muted-foreground hover:text-foreground"
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
                      selected ? 'bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full border border-border shrink-0"
                      style={{ backgroundColor: getColorHex(c) }}
                    />
                    <span className="text-xs flex-1">{c.nombre}</span>
                    <span className={`text-xs font-bold transition-opacity ${selected ? 'text-primary opacity-100' : 'opacity-0'}`}>
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowColorModal(false)}
              className="mt-3 w-full py-1.5 bg-primary text-primary-foreground rounded text-xs font-semibold hover:opacity-90"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
