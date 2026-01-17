-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "correo" VARCHAR(150) NOT NULL,
    "contrasena" TEXT NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'activo',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "roles" (
    "id_rol" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "tiendas" (
    "id_tienda" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "moneda" VARCHAR(10) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'activa',
    "id_propietario" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tiendas_pkey" PRIMARY KEY ("id_tienda")
);

-- CreateTable
CREATE TABLE "tienda_usuarios" (
    "id_tienda_usuario" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_tienda" INTEGER NOT NULL,
    "id_rol" INTEGER NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tienda_usuarios_pkey" PRIMARY KEY ("id_tienda_usuario")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id_categoria" SERIAL NOT NULL,
    "id_tienda" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "productos" (
    "id_producto" SERIAL NOT NULL,
    "id_tienda" INTEGER NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "precio_base" DECIMAL(10,2) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'activo',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "producto_categorias" (
    "id_producto_categoria" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "id_categoria" INTEGER NOT NULL,

    CONSTRAINT "producto_categorias_pkey" PRIMARY KEY ("id_producto_categoria")
);

-- CreateTable
CREATE TABLE "variantes_producto" (
    "id_variante" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "sku" VARCHAR(100) NOT NULL,
    "precio_especial" DECIMAL(10,2),
    "atributos" JSONB NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'activo',

    CONSTRAINT "variantes_producto_pkey" PRIMARY KEY ("id_variante")
);

-- CreateTable
CREATE TABLE "inventario" (
    "id_inventario" SERIAL NOT NULL,
    "id_variante" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "alerta_stock_minimo" INTEGER NOT NULL DEFAULT 0,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventario_pkey" PRIMARY KEY ("id_inventario")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id_pedido" SERIAL NOT NULL,
    "id_tienda" INTEGER NOT NULL,
    "nombre_cliente" VARCHAR(150) NOT NULL,
    "estado" VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    "total" DECIMAL(12,2) NOT NULL,
    "moneda" VARCHAR(10) NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id_pedido")
);

-- CreateTable
CREATE TABLE "detalle_pedidos" (
    "id_detalle_pedido" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "id_variante" INTEGER,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "detalle_pedidos_pkey" PRIMARY KEY ("id_detalle_pedido")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id_pago" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "metodo_pago" VARCHAR(50) NOT NULL,
    "proveedor_pago" VARCHAR(50),
    "estado" VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    "monto" DECIMAL(12,2) NOT NULL,
    "fecha_pago" TIMESTAMP(3),

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id_pago")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "tiendas_slug_key" ON "tiendas"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tienda_usuarios_id_usuario_id_tienda_key" ON "tienda_usuarios"("id_usuario", "id_tienda");

-- CreateIndex
CREATE UNIQUE INDEX "producto_categorias_id_producto_id_categoria_key" ON "producto_categorias"("id_producto", "id_categoria");

-- CreateIndex
CREATE UNIQUE INDEX "variantes_producto_sku_key" ON "variantes_producto"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "inventario_id_variante_key" ON "inventario"("id_variante");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_id_pedido_key" ON "pagos"("id_pedido");

-- AddForeignKey
ALTER TABLE "tiendas" ADD CONSTRAINT "tiendas_id_propietario_fkey" FOREIGN KEY ("id_propietario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tienda_usuarios" ADD CONSTRAINT "tienda_usuarios_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tienda_usuarios" ADD CONSTRAINT "tienda_usuarios_id_tienda_fkey" FOREIGN KEY ("id_tienda") REFERENCES "tiendas"("id_tienda") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tienda_usuarios" ADD CONSTRAINT "tienda_usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_id_tienda_fkey" FOREIGN KEY ("id_tienda") REFERENCES "tiendas"("id_tienda") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_id_tienda_fkey" FOREIGN KEY ("id_tienda") REFERENCES "tiendas"("id_tienda") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_categorias" ADD CONSTRAINT "producto_categorias_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_categorias" ADD CONSTRAINT "producto_categorias_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categorias"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variantes_producto" ADD CONSTRAINT "variantes_producto_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_id_variante_fkey" FOREIGN KEY ("id_variante") REFERENCES "variantes_producto"("id_variante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_id_tienda_fkey" FOREIGN KEY ("id_tienda") REFERENCES "tiendas"("id_tienda") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pedidos" ADD CONSTRAINT "detalle_pedidos_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pedidos" ADD CONSTRAINT "detalle_pedidos_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pedidos" ADD CONSTRAINT "detalle_pedidos_id_variante_fkey" FOREIGN KEY ("id_variante") REFERENCES "variantes_producto"("id_variante") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;
