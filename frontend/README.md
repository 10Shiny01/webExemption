# WebExemption — Frontend

React + Vite (JavaScript, CSS tradicional). Consome a API do backend em `../backend`.

## Como executar

1. Suba o backend: `cd backend && npm run dev` (porta 3000).
2. No frontend:

```bash
cd frontend
npm install
cp .env.example .env   # PowerShell: Copy-Item .env.example .env
npm run dev
```

Abra http://localhost:5173 e entre com um usuário cadastrado no banco.

Em desenvolvimento, as chamadas vão para `/backend/...` e o Vite as repassa ao Express
(`VITE_PROXY_TARGET`), então o backend não precisa de CORS. Em produção, defina `VITE_API_URL`
com a URL completa da API e libere CORS no backend (ou use um proxy reverso).

## Variáveis de ambiente

| Variável | Uso |
| --- | --- |
| `VITE_API_URL` | URL base da API (`/backend` em desenvolvimento) |
| `VITE_PROXY_TARGET` | Destino do proxy do Vite em desenvolvimento |
| `VITE_DIAS_ALERTA_VALIDADE` | Dias de antecedência para "próximo do vencimento" (igual ao `DIAS_ALERTA_VALIDADE` do backend) |

## Estrutura

```text
src/
├── components/   Sidebar, Header, AlertCard, StatCard, DataTable, FormField, Modal...
├── contexts/     AuthContext (sessão e perfil), ToastContext (mensagens)
├── hooks/        useFetch (carregar dados), useAcao (salvar/excluir com mensagens)
├── layouts/      AuthLayout, DashboardLayout
├── pages/        Login, Dashboard, Produtos, Entradas, Saidas, Receitas,
│                 Categorias, Relatorios, Usuarios, BalancoGeral
├── routes/       AppRoutes, ProtectedRoute
├── services/     api.js (requisições centralizadas) + um serviço por recurso
├── styles/       variables.css, global.css, components.css, layout.css
└── utils/        estoque.js (rótulos, datas e situação dos produtos)
```

## Pontos de atenção

- A API recebe `unidade`, `perfil` e o `tipo` da categoria como **índice numérico**
  (`unidade`: 0=g, 1=ml, 2=un; `perfil`: 0=funcionário, 1=adm; `tipo`: 0=receita, 1=venda).
  Os formulários já enviam o índice.
- O token JWT fica em `localStorage` e vale 10h; ao expirar (401), o usuário volta ao login.
- Alertas e indicadores do dashboard são calculados no navegador a partir de `/produto`,
  `/entrada` e `/saida`. Os alertas de validade só funcionam se a API devolver `validade` nos produtos.
- Para usar uma imagem de fundo no login, salve-a como `src/assets/fundo-login.jpg`
  (ou .png/.webp); a sobreposição vinho é aplicada automaticamente.
- PDFs (relatório de estoque e balanço) e a tela de usuários são exclusivos de administradores.
