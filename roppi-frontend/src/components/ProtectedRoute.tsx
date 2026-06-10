import {Navigate, Outlet} from 'react-router-dom';

interface ProtectedRouteProps {
    isAllowed: boolean;
    redirectTo?: string;
    children?: React.ReactNode;
}

export const ProtectedRoute = ({
    isAllowed,
    redirectTo = '/auth', 
    //Ruta a la que se redirige si no se cumple la condición
    children
}: ProtectedRouteProps) => {
    if (!isAllowed) {
        return <Navigate to={redirectTo} />;
    }

    //Si hay hijos, se renderizan, 
    //Si no, se renderiza el Outlet para las rutas anidadas
    return children ? <>{children}</> : <Outlet />;
};