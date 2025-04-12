let draggedCard = null;

document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".cards");
  const botaoAdicionarLista = document.querySelector(".add-list");

  carregarDoLocalStorage();

  // Aplica o tema salvo ao carregar a página
  if (localStorage.getItem("tema") === "dark") {
    document.body.classList.add("dark-mode");
  }

  // Configura o botão de alternar tema
  const toggleBtn = document.querySelector(".theme-toggle");
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("tema", document.body.classList.contains("dark-mode") ? "dark" : "light");
  });

  botaoAdicionarLista.addEventListener("click", () => {
    const lista = criarLista("Nova Lista", []);
    wrapper.insertBefore(lista, wrapper.querySelector(".title-fixe"));
    salvarNoLocalStorage();
  });

  // Fecha menus ao clicar fora
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".menu-options") && !e.target.closest(".menu-btn")) {
      document.querySelectorAll(".menu-options").forEach(menu => {
        menu.style.display = "none";
      });
    }
  });
});
function criarLista(titulo = "Sem título", cards = []) {
  const container = document.createElement("div");
  container.className = "team-container";

  container.innerHTML = `
    <div class="team-header">
      <span class="team-title-text">${titulo}</span>
      <input type="text" class="team-title-input" style="display: none;" />
      <div class="actions">
        <button class="menu-btn"><img src="../assets/Combined Shape.svg" alt=""></button>
        <div class="menu-options">
          <button class="edit-btn">Editar</button>
          <button class="delete-btn">Excluir</button>
        </div>
      </div>
    </div>
    <ul class="team-list"></ul>
    <div class="add-function">+ Adicionar um cartão</div>
  `;

  const ul = container.querySelector(".team-list");

  cards.forEach(card => {
    const li = criarCard(card.nome, card.description);
    ul.appendChild(li);
  });

  aplicarEdicaoTitulo(container);
  aplicarEventosAddFunction(container);

ul.addEventListener("dragover", handleDragOver);
ul.addEventListener("drop", handleDrop);

container.addEventListener("dragover", (e) => {
  if (e.target === container || e.target.classList.contains("add-function")) {
    e.preventDefault();
  }
});

container.addEventListener("drop", (e) => {
  e.preventDefault();
  if (draggedCard) {
    ul.appendChild(draggedCard);
    salvarNoLocalStorage();
  }
});

  return container;
}

function criarCard(nome = "Sem nome", description = "Sem descrição") {
  const li = document.createElement("li");
  li.className = "team-item";
  li.draggable = true;

  li.innerHTML = `
    <div class="name-description">
      <span class="team-name">${nome}</span>
      <span class="team-description">${description}</span>
    </div>
    <div class="actions">
      <button class="menu-btn"><img src="../assets/Combined Shape.svg" alt=""></button>
      <div class="menu-options">
        <button class="edit-btn">Editar</button>
        <button class="delete-btn">Excluir</button>
      </div>
    </div>
  `;

  li.addEventListener("dragstart", handleDragStart);
  li.addEventListener("dragend", handleDragEnd);

  aplicarEventosItem(li);
  return li;
}

function aplicarEdicaoTitulo(container) {
  const span = container.querySelector(".team-title-text");
  const input = container.querySelector(".team-title-input");
  const btnMenu = container.querySelector(".menu-btn");

  btnMenu.addEventListener("click", () => {
    const menu = container.querySelector(".menu-options");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });

  container.querySelector(".edit-btn").addEventListener("click", () => {
    input.value = span.textContent;
    span.style.display = "none";
    input.style.display = "inline-block";
    input.focus();
    container.querySelector(".menu-options").style.display = "none";
  });

  input.addEventListener("blur", () => {
    span.textContent = input.value.trim();
    span.style.display = "inline-block";
    input.style.display = "none";
    salvarNoLocalStorage();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
  });

  container.querySelector(".delete-btn").addEventListener("click", () => {
    container.remove();
    salvarNoLocalStorage();
  });
}

function aplicarEventosAddFunction(container) {
  const addBtn = container.querySelector(".add-function");
  const ul = container.querySelector(".team-list");

  addBtn.addEventListener("click", () => {
    const card = criarCard("Novo time", "Sem descrição");
    ul.appendChild(card);
    salvarNoLocalStorage();
  });
}

function aplicarEventosItem(item) {
  const menuBtn = item.querySelector(".menu-btn");
  const menu = item.querySelector(".menu-options");

  // Botão de abrir o menu (com posição fixa e visível corretamente)
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // evita conflito com o listener global de clique

    // Fecha todos os outros menus antes
    document.querySelectorAll(".menu-options").forEach(m => m.style.display = "none");

    // Toggle: se já está aberto, fecha
    if (menu.style.display === "block") {
      menu.style.display = "none";
      return;
    }

    // Calcula posição do botão
    const btnRect = menuBtn.getBoundingClientRect();

    // Posiciona o menu como FIXO na tela
    menu.style.position = "fixed";
    menu.style.top = `${btnRect.bottom + window.scrollY}px`;
    menu.style.left = `${btnRect.left}px`;
    menu.style.display = "block";
  });

  // Botão "Editar"
  item.querySelector(".edit-btn").addEventListener("click", () => {
    const nameSpan = item.querySelector(".team-name");
    const descSpan = item.querySelector(".team-description");

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = nameSpan.textContent;
    nameInput.className = "edit-input";

    const descInput = document.createElement("input");
    descInput.type = "text";
    descInput.value = descSpan.textContent;
    descInput.className = "edit-input";

    nameSpan.replaceWith(nameInput);
    descSpan.replaceWith(descInput);

    nameInput.addEventListener("blur", () => {
      const newNameSpan = document.createElement("span");
      newNameSpan.className = "team-name";
      newNameSpan.textContent = nameInput.value || "Sem nome";
      nameInput.replaceWith(newNameSpan);
      salvarNoLocalStorage();
    });

    descInput.addEventListener("blur", () => {
      const newDescSpan = document.createElement("span");
      newDescSpan.className = "team-description";
      newDescSpan.textContent = descInput.value || "Sem descrição";
      descInput.replaceWith(newDescSpan);
      salvarNoLocalStorage();
    });

    nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") nameInput.blur();
    });

    descInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") descInput.blur();
    });

    nameInput.focus();
    menu.style.display = "none";
  });

  // Botão "Excluir"
  item.querySelector(".delete-btn").addEventListener("click", () => {
    item.remove();
    salvarNoLocalStorage();
  });
}

function salvarNoLocalStorage() {
  const listas = [];

  document.querySelectorAll(".team-container").forEach(container => {
    const titulo = container.querySelector(".team-title-text")?.textContent.trim() || "";
    const cards = [];

    if (titulo === "") return;

    container.querySelectorAll(".team-item").forEach(item => {
      const nome = item.querySelector(".team-name")?.textContent || "Sem nome";
      const description = item.querySelector(".team-description")?.textContent || "Sem descrição";
      cards.push({ nome, description });
    });

    listas.push({ titulo, cards });
  });

  localStorage.setItem("listas", JSON.stringify(listas));
}

function carregarDoLocalStorage() {
  const listasSalvas = JSON.parse(localStorage.getItem("listas")) || [];
  const wrapper = document.querySelector(".cards");
  const btn = wrapper.querySelector(".title-fixe");

  listasSalvas.forEach(lista => {
    if (!lista.titulo || lista.titulo.trim() === "") return;
    const novaLista = criarLista(lista.titulo, lista.cards);
    wrapper.insertBefore(novaLista, btn);
  });
}

function limparLocalStorage() {
  localStorage.removeItem("listas");
  document.querySelectorAll(".team-container").forEach(container => container.remove());
}

// Drag and Drop

function handleDragStart(e) {
  draggedCard = this;
  setTimeout(() => {
    this.style.display = "none";
  }, 0);
}

function handleDragEnd(e) {
  this.style.display = "flex";
  draggedCard = null;
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();
  if (draggedCard && this.classList.contains("team-list")) {
    this.appendChild(draggedCard);
    salvarNoLocalStorage();
  }
}