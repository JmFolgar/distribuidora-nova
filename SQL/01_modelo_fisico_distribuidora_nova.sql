-- =============================================================================
-- DISTRIBUIDORA NOVA — Modelo físico (PostgreSQL)
-- =============================================================================
-- Fuente: diagrama E/R final (SQL/Diagramas-ER)
-- Convención: tablas FER_* ; atributos con prefijo de entidad
--
-- NO se almacenan (se calculan en aplicación/consultas):
--   subtotales, impuestos, descuentos, totales, cantidad recibida acumulada,
--   monto pagado, saldo pendiente, existencia disponible.
--
-- DISEÑO: no ejecutar aún hasta alinear migraciones Drizzle.
-- =============================================================================


-- =============================================================================
-- 1. UBICACIONES
-- =============================================================================

CREATE TABLE fer_departamento (
    dep_id_departamento     SERIAL PRIMARY KEY,
    dep_codigo              VARCHAR(20)  NOT NULL UNIQUE,
    dep_nombre              VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE fer_municipio (
    mun_id_municipio        SERIAL PRIMARY KEY,
    mun_id_departamento     INT NOT NULL REFERENCES fer_departamento(dep_id_departamento),
    mun_codigo              VARCHAR(20)  NOT NULL,
    mun_nombre              VARCHAR(100) NOT NULL,
    UNIQUE (mun_id_departamento, mun_nombre)
);

CREATE TABLE fer_direccion (
    dir_id_direccion        SERIAL PRIMARY KEY,
    dir_id_municipio        INT NOT NULL REFERENCES fer_municipio(mun_id_municipio),
    dir_zona                VARCHAR(50),
    dir_colonia             VARCHAR(100),
    dir_calle               VARCHAR(100),
    dir_avenida             VARCHAR(100),
    dir_numero_casa         VARCHAR(30),
    dir_referencia          TEXT
);


-- =============================================================================
-- 2. SEGURIDAD
-- =============================================================================

CREATE TABLE fer_usuario (
    usu_id_usuario          SERIAL PRIMARY KEY,
    usu_id_direccion        INT REFERENCES fer_direccion(dir_id_direccion),
    usu_primer_nombre       VARCHAR(80)  NOT NULL,
    usu_segundo_nombre      VARCHAR(80),
    usu_tercer_nombre       VARCHAR(80),
    usu_primer_apellido     VARCHAR(80)  NOT NULL,
    usu_segundo_apellido    VARCHAR(80),
    usu_nombre_usuario      VARCHAR(50)  NOT NULL UNIQUE,
    usu_correo              VARCHAR(150) NOT NULL UNIQUE,
    usu_telefono            VARCHAR(30),
    usu_clave_hash          VARCHAR(255) NOT NULL,
    usu_estado              VARCHAR(20)  NOT NULL,
    usu_intentos_fallidos   INT NOT NULL DEFAULT 0,
    usu_fecha_bloqueo       TIMESTAMP,
    usu_ultimo_acceso       TIMESTAMP,
    usu_fecha_creacion      TIMESTAMP NOT NULL DEFAULT NOW(),
    usu_fecha_modificacion  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE fer_rol (
    rol_id_rol              SERIAL PRIMARY KEY,
    rol_nombre              VARCHAR(50) NOT NULL UNIQUE,
    rol_descripcion         TEXT,
    rol_estado              VARCHAR(20) NOT NULL
);

CREATE TABLE fer_permiso (
    per_id_permiso          SERIAL PRIMARY KEY,
    per_codigo              VARCHAR(100) NOT NULL UNIQUE,
    per_nombre              VARCHAR(100) NOT NULL,
    per_modulo              VARCHAR(60)  NOT NULL,
    per_accion              VARCHAR(60)  NOT NULL,
    per_descripcion         TEXT,
    per_estado              VARCHAR(20)  NOT NULL
);

CREATE TABLE fer_usuario_rol (
    uro_id_usuario_rol      SERIAL PRIMARY KEY,
    uro_id_usuario          INT NOT NULL REFERENCES fer_usuario(usu_id_usuario),
    uro_id_rol              INT NOT NULL REFERENCES fer_rol(rol_id_rol),
    uro_fecha_asignacion    TIMESTAMP NOT NULL DEFAULT NOW(),
    uro_fecha_revocacion    TIMESTAMP,
    uro_estado              VARCHAR(20) NOT NULL,
    UNIQUE (uro_id_usuario, uro_id_rol)
);

CREATE TABLE fer_rol_permiso (
    rpe_id_rol_permiso      SERIAL PRIMARY KEY,
    rpe_id_rol              INT NOT NULL REFERENCES fer_rol(rol_id_rol),
    rpe_id_permiso          INT NOT NULL REFERENCES fer_permiso(per_id_permiso),
    rpe_fecha_asignacion    TIMESTAMP NOT NULL DEFAULT NOW(),
    rpe_estado              VARCHAR(20) NOT NULL,
    UNIQUE (rpe_id_rol, rpe_id_permiso)
);


-- =============================================================================
-- 3. PERSONAS COMERCIALES
-- =============================================================================

CREATE TABLE fer_cliente (
    cli_id_cliente          SERIAL PRIMARY KEY,
    cli_id_direccion        INT REFERENCES fer_direccion(dir_id_direccion),
    cli_tipo_persona        VARCHAR(20) NOT NULL, -- INDIVIDUAL | EMPRESA
    cli_nit                 VARCHAR(30),
    cli_primer_nombre       VARCHAR(80),
    cli_segundo_nombre      VARCHAR(80),
    cli_tercer_nombre       VARCHAR(80),
    cli_primer_apellido     VARCHAR(80),
    cli_segundo_apellido    VARCHAR(80),
    cli_razon_social        VARCHAR(200),
    cli_correo              VARCHAR(150),
    cli_telefono            VARCHAR(30),
    cli_estado              VARCHAR(20) NOT NULL,
    cli_fecha_creacion      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE fer_proveedor (
    prv_id_proveedor        SERIAL PRIMARY KEY,
    prv_id_direccion        INT NOT NULL REFERENCES fer_direccion(dir_id_direccion),
    prv_nit                 VARCHAR(30),
    prv_razon_social        VARCHAR(200) NOT NULL,
    prv_nombre_contacto     VARCHAR(150),
    prv_correo              VARCHAR(150) NOT NULL,
    prv_telefono            VARCHAR(30)  NOT NULL,
    prv_estado              VARCHAR(20)  NOT NULL,
    prv_fecha_creacion      TIMESTAMP NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- 4. PRODUCTOS (entidad principal del ventilador)
-- =============================================================================

CREATE TABLE fer_categoria (
    cat_id_categoria        SERIAL PRIMARY KEY,
    cat_nombre              VARCHAR(100) NOT NULL UNIQUE,
    cat_descripcion         TEXT,
    cat_estado              VARCHAR(20) NOT NULL
);

CREATE TABLE fer_unidad_medida (
    ume_id_unidad_medida    SERIAL PRIMARY KEY,
    ume_codigo              VARCHAR(20) NOT NULL UNIQUE,
    ume_nombre              VARCHAR(50) NOT NULL,
    ume_abreviatura         VARCHAR(10) NOT NULL,
    ume_estado              VARCHAR(20) NOT NULL
);

CREATE TABLE fer_producto (
    pro_id_producto         SERIAL PRIMARY KEY,
    pro_id_categoria        INT NOT NULL REFERENCES fer_categoria(cat_id_categoria),
    pro_id_unidad_medida    INT NOT NULL REFERENCES fer_unidad_medida(ume_id_unidad_medida),
    pro_codigo              VARCHAR(50)  NOT NULL UNIQUE,
    pro_nombre              VARCHAR(200) NOT NULL,
    pro_descripcion         TEXT,
    pro_precio_compra       NUMERIC(12,2) NOT NULL, -- costo actual
    pro_precio_venta        NUMERIC(12,2) NOT NULL,
    pro_porcentaje_impuesto NUMERIC(5,2)  NOT NULL DEFAULT 0,
    pro_existencia_minima   NUMERIC(12,2) NOT NULL DEFAULT 0,
    pro_estado              VARCHAR(20) NOT NULL,
    pro_fecha_creacion      TIMESTAMP NOT NULL DEFAULT NOW(),
    pro_fecha_modificacion  TIMESTAMP NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- 5. COMPRAS
-- =============================================================================

CREATE TABLE fer_compra (
    com_id_compra           SERIAL PRIMARY KEY,
    com_id_proveedor        INT NOT NULL REFERENCES fer_proveedor(prv_id_proveedor),
    com_numero_compra       VARCHAR(40) NOT NULL UNIQUE,
    com_fecha_compra        TIMESTAMP NOT NULL,
    com_fecha_esperada      DATE,
    com_estado              VARCHAR(30) NOT NULL,
    com_observacion         TEXT
);

CREATE TABLE fer_detalle_compra (
    dco_id_detalle_compra       SERIAL PRIMARY KEY,
    dco_id_compra               INT NOT NULL REFERENCES fer_compra(com_id_compra),
    dco_id_producto             INT NOT NULL REFERENCES fer_producto(pro_id_producto),
    dco_cantidad                NUMERIC(12,2) NOT NULL,
    dco_costo_unitario          NUMERIC(12,2) NOT NULL,
    dco_porcentaje_descuento    NUMERIC(5,2)  NOT NULL DEFAULT 0,
    dco_porcentaje_impuesto     NUMERIC(5,2)  NOT NULL DEFAULT 0
);

CREATE TABLE fer_recepcion (
    rec_id_recepcion        SERIAL PRIMARY KEY,
    rec_id_compra           INT NOT NULL REFERENCES fer_compra(com_id_compra),
    rec_numero_recepcion    VARCHAR(40) NOT NULL UNIQUE,
    rec_fecha_recepcion     TIMESTAMP NOT NULL,
    rec_estado              VARCHAR(30) NOT NULL,
    rec_observacion         TEXT
);

CREATE TABLE fer_detalle_recepcion (
    dre_id_detalle_recepcion    SERIAL PRIMARY KEY,
    dre_id_recepcion            INT NOT NULL REFERENCES fer_recepcion(rec_id_recepcion),
    dre_id_detalle_compra       INT NOT NULL REFERENCES fer_detalle_compra(dco_id_detalle_compra),
    dre_cantidad_recibida       NUMERIC(12,2) NOT NULL DEFAULT 0,
    dre_cantidad_rechazada      NUMERIC(12,2) NOT NULL DEFAULT 0,
    dre_motivo_rechazo          TEXT
);


-- =============================================================================
-- 6. INVENTARIO
-- =============================================================================

CREATE TABLE fer_inventario (
    inv_id_inventario           SERIAL PRIMARY KEY,
    inv_id_producto             INT NOT NULL UNIQUE REFERENCES fer_producto(pro_id_producto),
    inv_existencia_actual       NUMERIC(12,2) NOT NULL DEFAULT 0,
    inv_cantidad_reservada      NUMERIC(12,2) NOT NULL DEFAULT 0,
    inv_fecha_ultimo_movimiento TIMESTAMP,
    inv_version                 INT NOT NULL DEFAULT 1
);

CREATE TABLE fer_movimiento_inventario (
    mov_id_movimiento           SERIAL PRIMARY KEY,
    mov_id_inventario           INT NOT NULL REFERENCES fer_inventario(inv_id_inventario),
    mov_id_usuario              INT NOT NULL REFERENCES fer_usuario(usu_id_usuario),
    mov_tipo_movimiento         VARCHAR(20) NOT NULL, -- ENTRADA|SALIDA|AJUSTE|DEVOLUCION
    mov_cantidad                NUMERIC(12,2) NOT NULL,
    mov_existencia_anterior     NUMERIC(12,2) NOT NULL,
    mov_existencia_nueva        NUMERIC(12,2) NOT NULL,
    mov_fecha_movimiento        TIMESTAMP NOT NULL DEFAULT NOW(),
    mov_modulo_origen           VARCHAR(40) NOT NULL,
    mov_id_registro_origen      INT NOT NULL,
    mov_numero_documento        VARCHAR(40),
    mov_motivo                  TEXT
);

CREATE TABLE fer_alerta_inventario (
    ale_id_alerta               SERIAL PRIMARY KEY,
    ale_id_movimiento           INT NOT NULL REFERENCES fer_movimiento_inventario(mov_id_movimiento),
    ale_id_usuario_atiende      INT REFERENCES fer_usuario(usu_id_usuario),
    ale_tipo_alerta             VARCHAR(40) NOT NULL,
    ale_mensaje                 TEXT NOT NULL,
    ale_existencia_minima       NUMERIC(12,2) NOT NULL,
    ale_fecha_generacion        TIMESTAMP NOT NULL DEFAULT NOW(),
    ale_fecha_atencion          TIMESTAMP,
    ale_estado                  VARCHAR(20) NOT NULL
);


-- =============================================================================
-- 7. PEDIDOS
-- =============================================================================

CREATE TABLE fer_estado_pedido (
    epe_id_estado_pedido    SERIAL PRIMARY KEY,
    epe_codigo              VARCHAR(40) NOT NULL UNIQUE,
    epe_nombre              VARCHAR(80) NOT NULL,
    epe_orden               INT NOT NULL,
    epe_permite_modificar   BOOLEAN NOT NULL DEFAULT FALSE,
    epe_permite_facturar    BOOLEAN NOT NULL DEFAULT FALSE,
    epe_estado              VARCHAR(20) NOT NULL
);

CREATE TABLE fer_descuento (
    des_id_descuento            SERIAL PRIMARY KEY,
    des_nombre                  VARCHAR(100) NOT NULL,
    des_tipo                    VARCHAR(20)  NOT NULL, -- PORCENTAJE|MONTO
    des_valor                   NUMERIC(12,2) NOT NULL,
    des_requiere_aprobacion     BOOLEAN NOT NULL DEFAULT FALSE,
    des_fecha_inicio            DATE NOT NULL,
    des_fecha_fin               DATE NOT NULL,
    des_estado                  VARCHAR(20) NOT NULL
);

CREATE TABLE fer_pedido (
    ped_id_pedido               SERIAL PRIMARY KEY,
    ped_id_cliente              INT NOT NULL REFERENCES fer_cliente(cli_id_cliente),
    ped_id_estado_pedido        INT NOT NULL REFERENCES fer_estado_pedido(epe_id_estado_pedido),
    ped_id_descuento            INT REFERENCES fer_descuento(des_id_descuento),
    ped_numero_pedido           VARCHAR(40) NOT NULL UNIQUE,
    ped_fecha_pedido            TIMESTAMP NOT NULL DEFAULT NOW(),
    ped_fecha_requerida         DATE,
    ped_porcentaje_descuento    NUMERIC(5,2) NOT NULL DEFAULT 0,
    ped_observacion             TEXT
);

CREATE TABLE fer_detalle_pedido (
    dpe_id_detalle_pedido       SERIAL PRIMARY KEY,
    dpe_id_pedido               INT NOT NULL REFERENCES fer_pedido(ped_id_pedido),
    dpe_id_producto             INT NOT NULL REFERENCES fer_producto(pro_id_producto),
    dpe_cantidad                NUMERIC(12,2) NOT NULL,
    dpe_precio_unitario         NUMERIC(12,2) NOT NULL,
    dpe_porcentaje_descuento    NUMERIC(5,2)  NOT NULL DEFAULT 0,
    dpe_porcentaje_impuesto     NUMERIC(5,2)  NOT NULL DEFAULT 0
);

CREATE TABLE fer_historial_pedido (
    hpe_id_historial_pedido     SERIAL PRIMARY KEY,
    hpe_id_pedido               INT NOT NULL REFERENCES fer_pedido(ped_id_pedido),
    hpe_id_estado_anterior      INT REFERENCES fer_estado_pedido(epe_id_estado_pedido),
    hpe_id_estado_nuevo         INT NOT NULL REFERENCES fer_estado_pedido(epe_id_estado_pedido),
    hpe_id_usuario              INT NOT NULL REFERENCES fer_usuario(usu_id_usuario),
    hpe_fecha_cambio            TIMESTAMP NOT NULL DEFAULT NOW(),
    hpe_observacion             TEXT
);

CREATE TABLE fer_aprobacion (
    apr_id_aprobacion           SERIAL PRIMARY KEY,
    apr_id_pedido               INT NOT NULL REFERENCES fer_pedido(ped_id_pedido),
    apr_id_usuario_solicita     INT NOT NULL REFERENCES fer_usuario(usu_id_usuario),
    apr_id_usuario_autoriza     INT REFERENCES fer_usuario(usu_id_usuario),
    apr_tipo_aprobacion         VARCHAR(40) NOT NULL,
    apr_valor_solicitado        NUMERIC(12,2) NOT NULL,
    apr_valor_permitido         NUMERIC(12,2),
    apr_estado                  VARCHAR(20) NOT NULL,
    apr_fecha_solicitud         TIMESTAMP NOT NULL DEFAULT NOW(),
    apr_fecha_respuesta         TIMESTAMP,
    apr_observacion             TEXT
);


-- =============================================================================
-- 8. VENTAS Y PAGOS
-- =============================================================================

CREATE TABLE fer_venta (
    ven_id_venta                SERIAL PRIMARY KEY,
    ven_id_pedido               INT NOT NULL UNIQUE REFERENCES fer_pedido(ped_id_pedido),
    ven_numero_factura          VARCHAR(40) NOT NULL UNIQUE,
    ven_fecha_venta             TIMESTAMP NOT NULL DEFAULT NOW(),
    ven_estado                  VARCHAR(30) NOT NULL,
    ven_fecha_finalizacion      TIMESTAMP
);

CREATE TABLE fer_detalle_venta (
    dve_id_detalle_venta        SERIAL PRIMARY KEY,
    dve_id_venta                INT NOT NULL REFERENCES fer_venta(ven_id_venta),
    dve_id_detalle_pedido       INT NOT NULL REFERENCES fer_detalle_pedido(dpe_id_detalle_pedido),
    dve_cantidad                NUMERIC(12,2) NOT NULL,
    dve_precio_unitario         NUMERIC(12,2) NOT NULL,
    dve_costo_unitario          NUMERIC(12,2) NOT NULL,
    dve_porcentaje_descuento    NUMERIC(5,2)  NOT NULL DEFAULT 0,
    dve_porcentaje_impuesto     NUMERIC(5,2)  NOT NULL DEFAULT 0
);

CREATE TABLE fer_metodo_pago (
    mpa_id_metodo_pago          SERIAL PRIMARY KEY,
    mpa_codigo                  VARCHAR(30) NOT NULL UNIQUE,
    mpa_nombre                  VARCHAR(80) NOT NULL,
    mpa_requiere_referencia     BOOLEAN NOT NULL DEFAULT FALSE,
    mpa_estado                  VARCHAR(20) NOT NULL
);

CREATE TABLE fer_pago (
    pag_id_pago                 SERIAL PRIMARY KEY,
    pag_id_venta                INT NOT NULL REFERENCES fer_venta(ven_id_venta),
    pag_id_metodo_pago          INT NOT NULL REFERENCES fer_metodo_pago(mpa_id_metodo_pago),
    pag_numero_pago             VARCHAR(40) NOT NULL UNIQUE,
    pag_fecha_pago              TIMESTAMP NOT NULL DEFAULT NOW(),
    pag_monto                   NUMERIC(12,2) NOT NULL,
    pag_referencia              VARCHAR(100),
    pag_estado                  VARCHAR(20) NOT NULL,
    pag_observacion             TEXT
);


-- =============================================================================
-- 9. CONFIGURACIÓN Y AUDITORÍA
-- =============================================================================

CREATE TABLE fer_parametro (
    par_id_parametro            SERIAL PRIMARY KEY,
    par_id_usuario_modifica     INT NOT NULL REFERENCES fer_usuario(usu_id_usuario),
    par_codigo                  VARCHAR(100) NOT NULL UNIQUE,
    par_nombre                  VARCHAR(150) NOT NULL,
    par_valor                   TEXT NOT NULL,
    par_tipo_dato               VARCHAR(30) NOT NULL,
    par_descripcion             TEXT,
    par_estado                  VARCHAR(20) NOT NULL,
    par_fecha_modificacion      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE fer_auditoria (
    aud_id_auditoria            SERIAL PRIMARY KEY,
    aud_id_usuario              INT NOT NULL REFERENCES fer_usuario(usu_id_usuario),
    aud_fecha_evento            TIMESTAMP NOT NULL DEFAULT NOW(),
    aud_modulo                  VARCHAR(60) NOT NULL,
    aud_accion                  VARCHAR(60) NOT NULL,
    aud_entidad                 VARCHAR(80) NOT NULL,
    aud_id_registro             INT NOT NULL,
    aud_valor_anterior          TEXT,
    aud_valor_nuevo             TEXT,
    aud_direccion_ip            VARCHAR(45),
    aud_resultado               VARCHAR(30) NOT NULL,
    aud_mensaje                 TEXT
);


-- =============================================================================
-- 10. REPORTES
-- =============================================================================

CREATE TABLE fer_reporte (
    rep_id_reporte              SERIAL PRIMARY KEY,
    rep_codigo                  VARCHAR(40) NOT NULL UNIQUE,
    rep_nombre                  VARCHAR(150) NOT NULL,
    rep_descripcion             TEXT,
    rep_origen_datos            VARCHAR(100) NOT NULL,
    rep_permite_fechas          BOOLEAN NOT NULL DEFAULT FALSE,
    rep_estado                  VARCHAR(20) NOT NULL
);

CREATE TABLE fer_ejecucion_reporte (
    ere_id_ejecucion_reporte    SERIAL PRIMARY KEY,
    ere_id_reporte              INT NOT NULL REFERENCES fer_reporte(rep_id_reporte),
    ere_id_usuario              INT NOT NULL REFERENCES fer_usuario(usu_id_usuario),
    ere_fecha_ejecucion         TIMESTAMP NOT NULL DEFAULT NOW(),
    ere_filtros                 TEXT,
    ere_formato                 VARCHAR(20) NOT NULL, -- PDF|EXCEL|CSV
    ere_estado                  VARCHAR(20) NOT NULL,
    ere_ruta_archivo            VARCHAR(255),
    ere_mensaje_error           TEXT
);


-- =============================================================================
-- FIN
-- =============================================================================
