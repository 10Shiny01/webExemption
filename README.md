# WebExemption

Sistema de gerenciamento de estoque para padaria, desenvolvido como Trabalho de Conclusão de Curso (TCC).

## Problema que resolve

Padarias trabalham com muitos insumos, prazos de validade e consumo que varia ao longo da semana. O WebExemption centraliza o controle de produtos, entradas e saídas, e ajuda a identificar o que está acabando ou perto de vencer.

## Funcionalidades implementadas

- Autenticação com JWT e perfis de usuário (o cadastro de usuários é restrito ao administrador)
- Cadastro de categorias, produtos, ingredientes e receitas
- Registro de entradas e saídas de estoque, incluindo o uso de receitas
- Balanço geral do estoque por período (semanal ou mensal), com análise feita por IA
- Geração de PDFs: relatório de estoque e balanço
- Notificações push de alertas de estoque e validade, com agendamento diário

## Tecnologias

- Node.js e Express 5
- PostgreSQL (`pg`)
- JWT (`jsonwebtoken`), `bcrypt` e `zod`
- `pdfkit-table`, `node-cron` e `web-push`
- API de IA compatível com OpenAI (Groq)

O frontend em React está planejado e ainda não faz parte deste repositório.

## Requisitos

- Node.js 18 ou superior
- PostgreSQL
- npm

## Instalação

```bash
git clone https://github.com/10Shiny01/webExemption.git
cd webExemption/backend
npm install
```

## Variáveis de ambiente

Copie o arquivo de exemplo e preencha com os seus valores:

```bash
cp .env.example .env
```

No PowerShell do Windows: `Copy-Item .env.example .env`

| Variável | Descrição |
| --- | --- |
| `DB_URL` | URL de conexão com o PostgreSQL |
| `JWT_SECRET` | Segredo usado para assinar os tokens JWT |
| `AI_API_KEY`, `AI_API_URL`, `AI_MODEL`, `AI_TIMEOUT_MS` | Configuração da API de IA do balanço |
| `DIAS_ALERTA_VALIDADE` | Dias de antecedência para o alerta de validade |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Chaves das notificações push |

O arquivo `.env` nunca deve ser enviado ao GitHub.

## Banco de dados

1. Crie um banco PostgreSQL (por exemplo, `webexemption`).
2. Execute o script SQL das tabelas nesse banco (será adicionado à pasta `database/`).
3. Informe a URL de conexão na variável `DB_URL`.

## Como executar

```bash
cd backend
npm run dev
```

A porta do servidor é definida em `backend/app.js`.

## Testes

Ainda não há testes automatizados.

## Estrutura de pastas

```text
webExemption/
└── backend/
    ├── app.js
    ├── package.json
    └── src/
        ├── config/
        ├── controllers/
        ├── jobs/
        ├── libs/
        ├── middlewares/
        ├── models/
        ├── routes/
        └── services/
```

## Autoria

- Autor: Luiz Arthur
- Curso: _preencher_
- Instituição: _preencher_
- Orientador: _preencher_
- Ano: _preencher_