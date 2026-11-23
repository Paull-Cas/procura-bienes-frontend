# Sistema de procura de bienes

Interfaz web del sistema desarrollado por Renzo Paull Castañeda Cabanillas para E.I.G.R. CONTRATISTAS S.R.L. Incluye las pantallas de acceso, administración, requerimientos, compras, cotizaciones y transacciones.

## Recorrido recomendado del código

1. [`src`](src): entrada de la aplicación y organización de rutas.
2. [Procura de bienes](src/pages/procura_de_bienes): componentes, formularios y acceso a datos de compras/cotizaciones y requerimientos.
3. [Control de accesos](src/pages/control_de_accesos): gestión de usuarios.
4. [Transacciones](src/pages/transacciones): pantallas y formularios relacionados.
5. [`src/api_base.ts`](src/api_base.ts): dirección de API configurada mediante `VITE_API_BASE_URL`.

Para revisar el estilo de programación, sigue un formulario de cotización desde su componente hasta la función que envía la solicitud. Observa cómo se organiza el estado, las validaciones y el tratamiento de respuestas de la API.

## Herramientas y configuración

React, TypeScript y Vite. Dependencias y versiones en `package.json` y `package-lock.json`. Los recursos corporativos binarios y datos privados no se incluyen. Esta copia se centra en la lectura del código, por lo que no se asegura que estén disponibles todos los recursos visuales de la instalación original.

`VITE_API_BASE_URL` es la dirección pública del backend, no una contraseña. La autenticación del usuario continúa representada en el código; no se incluyen cuentas ni tokens reales.

## Alcance de esta copia

Código del proyecto preparado para revisión técnica. Se conserva la estructura y la lógica del trabajo original; se retiraron credenciales, datos de contacto privados, archivos de operación e historial Git. No se incluye una base de datos con información real ni un entorno de producción. Esta entrega permite leer el código; no certifica un despliegue ni ejecución completa.

Las variables necesarias están enumeradas, sin valores, en [`.env.example`](.env.example). Los secretos se definen fuera del repositorio. Las variables con prefijo `NEXT_PUBLIC_` o `VITE_` son visibles en el navegador y no deben contener contraseñas ni claves privadas. Las cadenas ficticias de pruebas y desarrollo están identificadas como tales y no son credenciales de producción.

La ausencia de una licencia de código abierto no concede permiso general para reutilizar el producto. Esta copia conserva las atribuciones existentes; la publicación y una licencia de reutilización se deciden por separado.
