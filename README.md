# 🧩 Trello Clone – Sistema de Listas, Cartões e Login

Este projeto é uma aplicação web inspirada no Trello, desenvolvida com HTML, CSS e JavaScript puro. Agora com **sistema de autenticação via e-mail**, persistência de dados por projeto e várias funcionalidades de produtividade visual.

---

## 🎨 Link do Figma (Design UI/UX)

🔗 [Acessar design no Figma](https://www.figma.com/design/AB70Pj5wfxKfKkIJPpHMcl/Trello?node-id=0-1&t=eWsuVY58in9iaNm3-1)

---

## ✨ Funcionalidades

- ✅ **Página de Login**
  - Validação de e-mail via `data.json`
  - Armazena usuário autenticado com `localStorage`
  - Redireciona automaticamente para o board se logado
- ✅ Criação e edição de listas
- ✅ Criação e edição de cartões com:
  - Título
  - Descrição
  - Imagem (upload local)
  - Nível de prioridade (Alta, Média, Baixa)
- ✅ Drag and drop suave entre listas (Sortable.js)
- ✅ Agrupamento por projetos (seleção dinâmica)
- ✅ Modo claro/escuro com persistência (localStorage)
- ✅ Indicadores no topo das listas:
  - Quantidade total de cartões
  - Quantidade de cartões com prioridade alta

---

## 🔐 Como funciona o Login

1. Usuário insere e-mail na tela de login
2. Sistema verifica se o e-mail está presente no `data.json`
3. Se válido:
   - Armazena no `localStorage`
   - Redireciona para `main.html`
4. Se inválido:
   - Exibe alerta e não redireciona

---

## 📁 Estrutura do Projeto

```
TRELLO/
├── assets/                  # Imagens, logos, ícones, ilustrações
├── css/
│   ├── style.css            # Estilo principal (board)
│   └── style-login.css      # Estilo da tela de login
├── html/
│   ├── data.json            # Base de e-mails válidos
│   ├── index-login.html     # Página de login
│   └── main.html            # Página principal (Trello)
├── js/
│   └── app.js               # Lógica do Trello
└── README.md
```

---

## 🧱 Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- [Sortable.js](https://github.com/SortableJS/Sortable) – drag and drop

---

## 🧠 Possibilidades Futuras

- 🔄 Integração com backend e banco de dados real
- 👥 Sistema multiusuário com autenticação segura
