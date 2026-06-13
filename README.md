# Roppi_TA-Ecommerce

Plataforma de Ecommerce para una tienda virtual de ropa de Gamarra, enfocado en estampados

## Frontend

## Backend

La arquitectura del backend usada es Services Oriented Architectura (SOA). Se cuenta con una API Gateway que redirige consultas a los respectivos servicios. Todos estos servicios comparten una misma base de datos.

Para ejecutar este contenedor, primero debes revisar el archivo **package.json** para ver los scripts disponibles para el iniciar los servicios. Lo primero que debes hacer es  actualizar y obtener los paquetes necesarios con el siguiente comando en la terminal.

```cmd
npm install
```

También, serán necesarios ejecutar los scripts que levantaran los diferentes servicios del backend.

### API Gateway

Para desplegar el API Gateway correr el siguiente comando en la carpeta **roppi-backend**.

```cmd
npm run start_api
```

### Servicios del negocio

Acá se encuentran los diferentes servicios, estos se han separado con la finalidad de que el sistema sea más resiliente ante erorres o conflictos.

#### Products Service

Para desplegar el Product Server correr el siguiente comando en la carpeta **roppi-backend**.

```cmd
npm run start_products_server
```

#### Users Service

Para desplegar el Product Server correr el siguiente comando en la carpeta **roppi-backend**.

```cmd
# TBD, Not Implemented Yet
```
