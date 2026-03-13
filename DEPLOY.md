# Deploy: React/Next.js → GitHub → Vercel

Guia para deploy automatizado com push para `main`.

## Pré-requisitos

- [Node.js](https://nodejs.org/) instalado
- [Homebrew](https://brew.sh/) (macOS)

### Instalar CLIs necessárias

```bash
brew install gh
npm i -g vercel
```

### Autenticar

```bash
gh auth login --web --git-protocol https
vercel login
```

## 1. Preparar o repositório Git

```bash
git init -b main
```

Criar `.gitignore` (se não existir):

```gitignore
node_modules
dist
.next
.env
.env.local
.env.*.local
.vercel
```

Fazer o commit inicial:

```bash
git add -A
git commit -m "Initial commit"
```

## 2. Criar repositório no GitHub e fazer push

```bash
gh repo create NOME_DO_REPO --public --source=. --push --remote=origin
```

Opções úteis:

- `--private` em vez de `--public` para repo privado
- `--description "Descrição do projeto"` para adicionar descrição

## 3. Conectar ao Vercel

### Linkar o projeto

```bash
vercel link --yes
```

O Vercel auto-detecta o framework (Next.js, Vite, etc.) e configura build/output.

### Conectar o repositório GitHub

```bash
vercel git connect --yes
```

Isso habilita **deploy automático** a cada push para `main`.

### Adicionar variáveis de ambiente

```bash
# Uma por vez
echo "valor" | vercel env add NOME_DA_VAR production

# Ou via dashboard
# https://vercel.com → Project → Settings → Environment Variables
```

### Fazer o primeiro deploy

```bash
vercel --prod --yes
```

## 4. Fluxo contínuo

A partir de agora, qualquer push para `main` dispara um deploy automático:

```bash
git add -A
git commit -m "feat: nova funcionalidade"
git push origin main
```

- Push para `main` → **Production deploy**
- Push para outras branches → **Preview deploy** (URL temporária)

## Comandos úteis

```bash
# Ver deployments
vercel ls

# Ver logs do último deploy
vercel logs

# Inspecionar deploy
vercel inspect DEPLOY_URL

# Remover variável de ambiente
vercel env rm NOME_DA_VAR production

# Listar variáveis de ambiente
vercel env ls
```

## Troubleshooting

### Build falha no Vercel

Testar o build localmente antes de fazer push:

```bash
npm run build
```

### Variáveis de ambiente não carregam

- Variáveis com prefixo `NEXT_PUBLIC_` (Next.js) ou `VITE_` (Vite) são expostas no client
- Após adicionar/alterar env vars, é necessário fazer um novo deploy:

```bash
vercel --prod --yes
```

### Domínio customizado

```bash
vercel domains add meusite.com
```

Configurar DNS conforme instruções exibidas pelo CLI.
