# WebExemption

Sistema de gerenciamento de estoque para padaria, desenvolvido como Trabalho de Conclusão de Curso (TCC).

## Problema que resolve

Padarias trabalham com muitos insumos, prazos de validade e consumo que varia ao longo da semana. O WebExemption centraliza o controle de produtos, entradas e saídas, e ajuda a identificar o que está acabando ou perto de vencer.

## Funcionalidades implementadas

- Autenticação com JWT e perfis de usuário (o cadastro de usuários é restrito ao administrador)
- Cadastro de categorias, produtos, ingredientes e receitas, com controle de validade
- Registro de entradas e saídas de estoque, incluindo o uso de receitas
- Balanço geral do estoque por período, com análise feita por IA
- Geração de PDFs: relatório de estoque e balanço
- Notificações push de alertas de estoque e validade, com agendamento diário (backend)
- Interface web com telas de login, dashboard, categorias, produtos, receitas, entradas, saídas, relatórios, balanço geral e usuários

## Tecnologias

**Backend**

- Node.js e Express 5
- PostgreSQL (`pg`)
- JWT (`jsonwebtoken`), `bcrypt` e `zod`
- `pdfkit-table`, `node-cron` e `web-push`
- API de IA compatível com OpenAI (Groq)

**Frontend**

- React 18 e Vite 5
- React Router 6
- lucide-react (ícones)

## Requisitos

- Node.js 20 ou superior
- PostgreSQL
- npm

## Instalação

```bash
git clone https://github.com/10Shiny01/webExemption.git
cd webExemption

cd backend
npm install

cd ../frontend
npm install
```

## Variáveis de ambiente

Cada parte do projeto tem o seu `.env`. Copie o arquivo de exemplo e preencha com os seus valores.

No PowerShell do Windows:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

**Backend (`backend/.env`)**

| Variável | Descrição |
| --- | --- |
| `DB_URL` | URL de conexão com o PostgreSQL |
| `JWT_SECRET` | Segredo usado para assinar os tokens JWT |
| `AI_API_KEY`, `AI_API_URL`, `AI_MODEL`, `AI_TIMEOUT_MS` | Configuração da API de IA do balanço |
| `DIAS_ALERTA_VALIDADE` | Dias de antecedência para o alerta de validade |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Chaves das notificações push |

**Frontend (`frontend/.env`)**

| Variável | Descrição |
| --- | --- |
| `VITE_API_URL` | URL base da API (em desenvolvimento, `/backend`, repassado pelo proxy do Vite) |
| `VITE_PROXY_TARGET` | Endereço do Express usado pelo proxy em desenvolvimento |
| `VITE_DIAS_ALERTA_VALIDADE` | Mesmo valor de `DIAS_ALERTA_VALIDADE` do backend |

Os arquivos `.env` nunca devem ser enviados ao GitHub.

## Banco de dados

1. Crie um banco PostgreSQL (por exemplo, `webexemption`).
2. Execute o script SQL das tabelas nesse banco (será adicionado à pasta `database/`).
3. Informe a URL de conexão na variável `DB_URL`.

## Como executar

Em dois terminais separados:

```bash
# Terminal 1: backend (porta 3000)
cd backend
npm run dev
```

```bash
# Terminal 2: frontend
cd frontend
npm run dev
```

O Vite mostra no terminal o endereço para abrir o frontend no navegador.

## Testes

Ainda não há testes automatizados.

## Estrutura de pastas

```text
webExemption/
├── backend/
│   ├── app.js
│   ├── package.json
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── jobs/
│       ├── libs/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       └── services/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── styles/
│       └── utils/
├── .gitignore
├── .gitattributes
└── README.md
```

## Autoria

- Autor: Luiz Arthur
- Curso: _preencher_
- Instituição: _preencher_
- Orientador: _preencher_
- Ano: _preencher_