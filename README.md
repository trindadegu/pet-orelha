# PetShop - Sistema de Gestão de Pet Shop

Este é um sistema completo para gestão de Pet Shop, incluindo E-commerce de produtos e agendamento de serviços.

## Tecnologias Utilizadas

- **Frontend**: React, Vite, Tailwind CSS, Shadcn/UI, Wouter, TanStack Query.
- **Backend**: Node.js, Express.
- **Banco de Dados**: PostgreSQL com Drizzle ORM.
- **Autenticação**: Passport.js.

## Como Rodar Localmente

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o banco de dados PostgreSQL e adicione a URL em um arquivo `.env` ou segredo do Replit:
   ```
   DATABASE_URL=seu_postgres_url
   ```
4. Execute as migrações:
   ```bash
   npm run db:push
   ```
5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Guia de Hospedagem no Render

Para hospedar este projeto no [Render](https://render.com/), siga estes passos:

### 1. Criar Banco de Dados PostgreSQL
- No painel do Render, clique em **New +** e selecione **PostgreSQL**.
- Dê um nome ao banco e escolha a região mais próxima.
- Após criado, copie a **Internal Database URL** (ou External se for testar localmente).

### 2. Criar Web Service
- Clique em **New +** e selecione **Web Service**.
- Conecte seu repositório GitHub/GitLab.
- Configure os campos:
  - **Name**: petshop-system
  - **Runtime**: Node
  - **Build Command**: `npm install && npm run build`
  - **Start Command**: `npm start`
- Adicione as **Environment Variables**:
  - `DATABASE_URL`: (A URL que você copiou do banco de dados)
  - `NODE_ENV`: `production`
  - `SESSION_SECRET`: (Uma string aleatória e segura para as sessões)

### 3. Finalização
- O Render irá buildar a aplicação e expor uma URL pública (ex: `petshop-system.onrender.com`).
- O sistema detectará automaticamente o ambiente de produção e servirá o frontend compilado.

---

## Script SQL do Banco de Dados

Caso precise criar as tabelas manualmente ou em outro ambiente, utilize o script abaixo:

```sql
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"category" text NOT NULL,
	"image" text NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"duration" integer NOT NULL,
	"image" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"pet_name" text NOT NULL,
	"service_id" integer NOT NULL,
	"service_name" text NOT NULL,
	"date" timestamp NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"customer_name" text NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
```
