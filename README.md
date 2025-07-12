# Lapes Food

Bem-vindo ao **Lapes Food**! Este projeto foi desenvolvido como solução para o Desafio Backend LAPES, com o objetivo de criar um sistema completo de administração para restaurantes, incluindo autenticação, gerenciamento de cardápio, pedidos, delivery, avaliações, relatórios e integrações modernas.

---

## 🚀 Stack Utilizada

- **TypeScript** – Segurança de tipos e melhor experiência de desenvolvimento
- **Next.js** – Framework full-stack React
- **TailwindCSS** – Estilização rápida e moderna
- **shadcn/ui** – Componentes de UI reutilizáveis
- **Elysia** – Framework backend rápido e type-safe
- **Bun** – Ambiente de execução moderno
- **Drizzle ORM** – ORM para TypeScript
- **PostgreSQL** – Banco de dados relacional
- **Autenticação** – Email e senha com Better Auth
- **Turborepo** – Monorepo otimizado

---

## 📋 Funcionalidades

- Sistema completo de autenticação com refresh tokens
- CRUD de usuários, categorias, pratos, pedidos, avaliações e entregadores
- Upload e gestão de fotos dos pratos (AWS S3)
- Sistema de roles e permissões (admin, cozinha, cliente)
- Notificações por Email (S3)
- Cálculo de frete e áreas de entrega
- Relatórios e analytics para administração
- Logs estruturados e tratamento robusto de erros
- Busca avançada no cardápio
- Testes unitários
- Documentação da API (Swagger/OpenAPI)

---

## 🛠️ Como rodar o projeto

1. **Clone o repositório**
   ```sh
   git clone https://github.com/seu-usuario/lapes-food.git
   cd lapes-food
   ```

2. **Instale as dependências**
   ```sh
   bun install
   ```

3. **Configure o banco de dados**
   - Certifique-se de ter o PostgreSQL instalado e rodando.
   - Configure as variáveis de ambiente (`.env`) com as credenciais do banco.
   - Execute as migrations:
     ```sh
     bun run drizzle:push
     ```

4. **Inicie a aplicação**
   ```sh
   bun run dev
   ```

---

## 📦 Configuração de Integrações

- **S3**: Configure as chaves de acesso no arquivo `.env`
- **Email**: Configure as credenciais de envio de notificações no arquivo `.env`

---

## 🧪 Testes

Execute os testes unitários:
```sh
bun run test
```

---

## 📑 Documentação

Acesse a documentação completa da API em `/docs` (Swagger) após iniciar o projeto.

---

## 🗂 Estrutura do Projeto

- **/apps** – Aplicações (frontend e backend)
- **/packages** – Bibliotecas compartilhadas e utilitários
- **/drizzle** – Migrations e modelos do banco
- **/docs** – Documentação

---

## 🤝 Contribuição

Contribuições são bem-vindas! Siga o padrão de commits [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) e utilize Pull Requests.

---
