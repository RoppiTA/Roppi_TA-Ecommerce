import { BrowserRouter } from 'react-router-dom';
import AppRouter from './navigation/appRouter';

function App() {
  /*Regina: Se utiliza el AppRouter como principal orquestador 
   para las entradas al sistemas por lo cual esta sección es 
   sencilla. Ahorita esta implementado un proyecto de ejemplo
   "Merchant" dado que no se cómo sacar del backend el producto.
   Confirmare con Max mas tarde*/
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;