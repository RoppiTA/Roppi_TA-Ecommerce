import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
} from '@mui/material';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Descuento } from '../../types/producto/descuento.types';
import { ProductoGenerico } from '../../types/producto/productoGen.types';

interface DiscountTableProps {
  discounts: Descuento[];
  products: ProductoGenerico[];
  onAddDiscount: () => void;
  onEditDiscount: (discount: Descuento) => void;
  onDeleteDiscount: (id: number) => void;
}

export function DiscountTable({
  discounts,
  products,
  onAddDiscount,
  onEditDiscount,
  onDeleteDiscount,
}: DiscountTableProps) {
  const getProductNames = (productIds: number[]) => {
    return productIds
      .map((id) => products.find((p) => p.id === id)?.nombre)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2>Gestión de Descuentos</h2>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={onAddDiscount}
        >
          Agregar Descuento
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre del Descuento</TableCell>
              <TableCell align="right">Cantidad Aplicable</TableCell>
              <TableCell align="right">Porcentaje (%)</TableCell>
              <TableCell>Productos Vinculados</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {discounts.map((discount) => (
              <TableRow key={discount.id} hover>
                <TableCell>{discount.nombre}</TableCell>
                <TableCell align="right">{discount.cantidad}</TableCell>
                <TableCell align="right">{discount.porcentajeDescuento}%</TableCell>
                <TableCell>{getProductNames(discount.idGenericoVinculados)}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => onEditDiscount(discount)}
                  >
                    <Pencil size={18} />
                  </IconButton>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => onDeleteDiscount(discount.id)}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
