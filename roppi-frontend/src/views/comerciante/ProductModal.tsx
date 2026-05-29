import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { ProductoGenerico } from '../../types/producto/productoGen.types';
import assets from '../../assets/assets.js';

interface ProductModalProps {
  open: boolean;
  product: ProductoGenerico | null;
  onClose: () => void;
  onSave: (product: ProductoGenerico) => void;
}

export function ProductModal({ open, product, onClose, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    description: '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.nombre,
        image: assets.maxwell,
        description: product.descripcion,
      });
    } else {
      setFormData({
        name: '',
        image: '',
        description: '',
      });
    }
  }, [product, open]);

 /* const handleSubmit = () => {
    const productData: ProductoGenerico = {
      id: product?.id || 0,
      ...formData,
    };
    onSave(productData);
  };*/

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{product ? 'Editar Producto' : 'Agregar Producto'}</DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-4 mt-4">
          <TextField
            label="Nombre del Producto"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="URL de la Imagen"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            fullWidth
          />
          <TextField
            label="Descripción"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            fullWidth
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button /*onClick={handleSubmit}*/ variant="contained">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
