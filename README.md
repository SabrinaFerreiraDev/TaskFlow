# TaskFlow

Uma aplicação de gerenciamento de tarefas, com frontend React e API Express persistida em PostgreSQL.

## Tecnologias

### Frontend

- React
- Vite
- Axios
- Context API

### Backend

- Node.js
- Express
- Zod
- Prisma

### Banco de dados

- PostgreSQL

## Funcionalidades

- Criação, edição e exclusão de tarefas
- Favoritos
- Conclusão de tarefas
- Categorias e prioridades
- Filtros e busca
- Persistência em PostgreSQL

## Estrutura

```text
TaskFlow/
├── FrontEnd/
└── Backend/
```

## Execução local

Em terminais separados:

```bash
cd Backend
npm install
npm run dev
```

```bash
cd FrontEnd
npm install
npm run dev
```

Configure as variáveis de ambiente locais a partir dos arquivos `.env.example`. Os arquivos `.env` e `.env.local` não devem ser versionados.

## Scripts principais

| Projeto | Desenvolvimento | Build/produção |
| --- | --- | --- |
| FrontEnd | `npm run dev` | `npm run build` |
| Backend | `npm run dev` | `npm start` |
