# 🌐 Global Tech News AI

> Agregador automatizado de notícias tecnológicas globais com tradução automática para português.

---

## 📸 Visão Geral

Este projeto coleta automaticamente notícias de tecnologia de **10+ fontes globais** (inglês, espanhol, português, chinês e hindi), traduz tudo para o português e exibe em um site moderno com **dark mode**, busca e filtros por idioma.

**Funciona 100% gratuitamente:**
- 🔄 **GitHub Actions** — coleta e traduz notícias a cada 1 hora
- 🌍 **GitHub Pages** — hospeda o site sem custo
- 🤖 **deep-translator** — tradução via Google Translate (gratuito)

---

## 🗂 Estrutura do Projeto

```
project-news/
├── index.html              # Página principal do site
├── style.css               # Estilos (dark mode, responsivo)
├── script.js               # Lógica de filtros, busca e renderização
├── data/
│   └── news.json           # Notícias coletadas (gerado automaticamente)
├── scripts/
│   └── fetch_news.py       # Script de coleta e tradução
├── .github/
│   └── workflows/
│       └── update-news.yml # Automação via GitHub Actions
├── requirements.txt        # Dependências Python
└── README.md               # Esta documentação
```

---

## 🚀 Como Publicar no GitHub

### 1. Criar repositório

```bash
# Inicializar git no diretório do projeto
git init
git add .
git commit -m "feat: projeto inicial Global Tech News AI"
```

### 2. Conectar ao GitHub

```bash
# Substitua SEU_USUARIO e SEU_REPO pelos seus dados
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git branch -M main
git push -u origin main
```

### 3. Ativar GitHub Pages

1. Vá em **Settings** → **Pages**
2. Em **Source**, selecione `Deploy from a branch`
3. Escolha a branch `main` e pasta `/ (root)`
4. Clique em **Save**

Seu site estará disponível em:
`https://SEU_USUARIO.github.io/SEU_REPO`

---

## ⚙️ Como Ativar GitHub Actions

O GitHub Actions **já está configurado** no arquivo `.github/workflows/update-news.yml`.

Após o push, ele será executado:
- ✅ Automaticamente a cada **1 hora**
- ✅ Em todo `git push` para `main`
- ✅ Manualmente pelo painel em **Actions → Run workflow**

### Verificar execução

Acesse: `github.com/SEU_USUARIO/SEU_REPO/actions`

---

## 💻 Como Executar Localmente

### Pré-requisitos

- Python 3.9+
- pip

### Instalar dependências

```bash
pip install -r requirements.txt
```

### Coletar notícias

```bash
python scripts/fetch_news.py
```

Isso vai criar/atualizar `data/news.json`.

### Visualizar o site

Use qualquer servidor local. Exemplos:

```bash
# Python (mais simples)
python -m http.server 8000

# Node.js (se tiver npx)
npx serve .
```

Abra `http://localhost:8000` no navegador.

---

## ➕ Como Adicionar Novas Fontes RSS

Abra `scripts/fetch_news.py` e edite o dicionário `RSS_SOURCES`:

```python
RSS_SOURCES = {
    "en": [
        # Adicione sua fonte aqui:
        {"url": "https://exemplo.com/feed.xml", "name": "Nome da Fonte"},
        ...
    ],
    ...
}
```

**Idiomas suportados:**

| Chave | Idioma     |
|-------|------------|
| `en`  | Inglês     |
| `es`  | Espanhol   |
| `pt`  | Português  |
| `zh`  | Chinês     |
| `hi`  | Hindi      |

Para adicionar um novo idioma, basta criar uma nova chave no dicionário e adicionar o nome do idioma em `LANG_MAP` no `script.js`.

---

## ⏰ Como Alterar a Frequência de Atualização

Edite `.github/workflows/update-news.yml`:

```yaml
on:
  schedule:
    - cron: "0 * * * *"   # A cada hora (padrão)
    # Exemplos alternativos:
    # - cron: "*/30 * * * *"  # A cada 30 minutos
    # - cron: "0 */6 * * *"   # A cada 6 horas
    # - cron: "0 8 * * *"     # Todo dia às 8h UTC
```

**Referência cron:** `Minuto Hora DiaMes Mes DiaSemana`

---

## 🧠 Como Funciona a Tradução

O script usa a biblioteca [deep-translator](https://github.com/nidhaloff/deep-translator) com o motor **Google Translate** (gratuito, sem API key).

- Se a tradução falhar (rate limit, timeout), o texto original é mantido.
- Textos maiores que 4500 caracteres são truncados antes da tradução.
- Um delay de 300ms entre traduções evita bloqueios por excesso de requisições.

---

## 🛠 Tecnologias Utilizadas

| Categoria   | Tecnologia             |
|-------------|------------------------|
| Frontend    | HTML5, CSS3, JavaScript |
| Backend     | Python 3               |
| Coleta RSS  | feedparser             |
| HTTP        | requests               |
| Tradução    | deep-translator        |
| Automação   | GitHub Actions         |
| Hospedagem  | GitHub Pages           |

---

## 📄 Fontes de Notícias

| Fonte              | Idioma     | URL                              |
|--------------------|------------|----------------------------------|
| TechCrunch         | Inglês     | techcrunch.com                   |
| The Verge          | Inglês     | theverge.com                     |
| Wired              | Inglês     | wired.com                        |
| Ars Technica       | Inglês     | arstechnica.com                  |
| MIT Tech Review    | Inglês     | technologyreview.com             |
| Xataka             | Espanhol   | xataka.com                       |
| Genbeta            | Espanhol   | genbeta.com                      |
| Canaltech          | Português  | canaltech.com.br                 |
| Tecnoblog          | Português  | tecnoblog.net                    |
| Olhar Digital      | Português  | olhardigital.com.br              |
| 36Kr               | Chinês     | 36kr.com                         |
| YourStory          | Hindi      | yourstory.com                    |

---

## 📝 Licença

Projeto open source para fins educacionais e de portfólio.  
O conteúdo das notícias pertence às respectivas fontes originais.

---

*Feito com ❤️ e automatizado com GitHub Actions*
