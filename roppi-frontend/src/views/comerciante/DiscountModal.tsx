import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  OutlinedInput,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material';
import { Descuento } from '../../types/producto/descuento.types';
import { ProductoGenerico } from '../../types/producto/productoGen.types';

interface DiscountModalProps {
  open: boolean;
  discount: Descuento | null;
  products: ProductoGenerico[];
  onClose: () => void;
  onSave: (discount: Descuento) => void;
}

export function DiscountModal({
  open,
  discount,
  products,
  onClose,
  onSave,
}: DiscountModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    cantidad: 0,
    porcentajeDescuento: 0,
    idGenericoVinculados: [] as number[],
  });

  useEffect(() => {
    if (discount) {
      setFormData({
        nombre: discount.nombre,
        cantidad: discount.cantidad,
        porcentajeDescuento: discount.porcentajeDescuento,
        idGenericoVinculados: discount.idGenericoVinculados,
      });
    } else {
      setFormData({
        nombre: '',
        cantidad: 0,
        porcentajeDescuento: 0,
        idGenericoVinculados: [],
      });
    }
  }, [discount, open]);

  const handleSubmit = () => {
    const discountData: Descuento = {
      id: discount?.id || 0,
      ...formData,
    };
    onSave(discountData);
  };

const handleProductChange = (event: SelectChangeEvent<number[]>) => {
  const value = event.target.value;

  setFormData({
    ...formData,
    idGenericoVinculados:
      typeof value === 'string'
        ? value.split(',').map(Number)
        : value,
  });
};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {discount ? 'Editar Descuento' : 'Agregar Descuento'}
      </DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-4 mt-4">
          <TextField
            label="Nombre del Descuento"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            fullWidth
          />
          <TextField
            label="Cantidad Aplicable"
            type="number"
            value={formData.cantidad}
            onChange={(e) =>
              setFormData({ ...formData, cantidad: Number(e.target.value) || 0 })
            }
            fullWidth
          />
          <TextField
            label="Porcentaje del Descuento (%)"
            type="number"
            value={formData.porcentajeDescuento}
            onChange={(e) =>
              setFormData({ ...formData, porcentajeDescuento: Number(e.target.value) || 0 })
            }
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Productos Vinculados</InputLabel>
            <Select<number[]>
              multiple
              value={formData.idGenericoVinculados}
              onChange={handleProductChange}
              input={<OutlinedInput label="Productos Vinculados" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((productId) => {
                    const product = products.find((p) => p.id === productId);
                    return <Chip key={productId} label={product?.nombre} />;
                  })}
                </Box>
              )}
            >
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
