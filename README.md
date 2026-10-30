# NORTHORYA FORMS STUDIO

Plataforma proprietária e autônoma de criação de formulários interativos, auditorias de vida, diagnósticos comportamentais, CRM de leads e gestão soberana de dados para a **Northorya**.

---

## 1. Visão Geral & Diferenciais

O **Northorya Forms Studio** foi concebido para libertar a Northorya de custos de assinatura obrigatórios de ferramentas externas (como Typeform, Tally ou Fillout), garantindo:

- **Soberania Absoluta dos Dados**: Todos os questionários, respostas reflexivas e contatos permanecem sob controle direto da empresa.
- **Editor Visual WYSIWYG Sem Código**: Adicione, reordene, duplique e configure mais de 20 tipos de perguntas, lógica condicional e temas sem alterar uma linha de código.
- **Modos de Apresentação Flexíveis**:
  - *Modo Conversacional*: Uma pergunta por vez, atalhos de teclado (Enter, 1-9, A-Z), barra de progresso e transições fluidas.
  - *Modo Clássico*: Fluxo unificado para preenchimento sequencial corrido.
- **CRM Integrado & Prioridade WhatsApp**: Identificação e deduplicação inteligente de leads por e-mail ou telefone internacional, alteração de status comercial (*Novo lead*, *Contatado*, *Call agendada*, *Call realizada*, *Proposta enviada*, *Em negociação*, *Cliente*), anotações confidenciais e link direto para WhatsApp (`wa.me/...`).
- **Conformidade LGPD**: Registro explícito de termos de consentimento, segregação de dados sensíveis e exclusão definitiva a pedido do titular (Direito ao Esquecimento).
- **Preparado para a Horya AI**: Identificadores universais e barramento de eventos prontos para síntese inteligente de auditorias por consultores autorizados.

---

## 2. Instalação e Execução Local

### Pré-requisitos
- Node.js 20+ ou 22+
- npm 10+

### Passo a Passo
```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo desenvolvimento (Porta 3000)
npm run dev

# 3. Testar compilação de produção
npm run build
npm start
```

---

## 3. Deploy em Servidor Próprio com Docker

```bash
# 1. Clonar repositório no servidor VPS
git clone https://github.com/northorya/forms-studio.git
cd forms-studio

# 2. Iniciar contêiner em segundo plano
docker compose up -d --build

# 3. Verificar status do serviço
docker compose ps
docker compose logs -f
```

O diretório `./data` é montado como volume persistente, preservando todos os formulários, respostas e contatos mesmo em reinicializações do contêiner.

---

## 4. Backup e Restauração

### Backup Automático via Painel
1. Acesse o menu **Configurações** no painel administrativo.
2. Clique no botão **Exportar Banco Completo (JSON)**.
3. O snapshot de todos os formulários, versões, contatos e submissões será baixado imediatamente.

### Backup Manual via Arquivo
O banco de dados fica salvo em:
```
data/northorya-db.json
data/northorya-db.backup.json
```
Basta copiar estes arquivos para seu armazenamento frio (S3, Google Drive ou backup diário por cron).

---

## 5. Endpoints da API

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/health` | Verificação de integridade e status da plataforma |
| `GET` | `/api/forms` | Lista todos os formulários e contadores |
| `POST` | `/api/forms` | Cria novo formulário via editor |
| `GET` | `/api/forms/:id` | Recupera formulário completo com campos e regras |
| `PUT` | `/api/forms/:id` | Atualiza rascunho (autosave do editor) |
| `POST` | `/api/forms/:id/publish` | Publica nova versão estável (v1, v2...) |
| `POST` | `/api/forms/:id/duplicate` | Clona formulário existente |
| `DELETE` | `/api/forms/:id` | Exclui formulário |
| `GET` | `/api/public/forms/:slug` | Acesso público do respondente sem autenticação |
| `POST` | `/api/public/forms/:slug/submit` | Salva submissão, cria lead e sincroniza CRM |
| `POST` | `/api/public/forms/:slug/event` | Rastreia visualizações, inícios e conclusões |
| `GET` | `/api/submissions` | Lista submissões com suporte a busca e filtros |
| `DELETE` | `/api/submissions/:id` | Exclui submissão autorizada |
| `GET` | `/api/contacts` | Lista contatos e leads do CRM |
| `PATCH` | `/api/contacts/:id` | Atualiza status comercial e anotações do consultor |
| `DELETE` | `/api/contacts/:id` | Exclui contato (Direito ao Esquecimento LGPD) |
| `GET` | `/api/templates` | Biblioteca de templates oficiais Northorya |
| `GET` | `/api/stats` | Estatísticas gerais do Dashboard |
| `GET` | `/api/export` | Exportação integral do banco em JSON |
