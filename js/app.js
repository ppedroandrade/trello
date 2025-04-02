document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".cards");
  const botaoAdicionarLista = document.querySelector(".add-list");

  carregarDoLocalStorage();

  botaoAdicionarLista.addEventListener("click", () => {
    const lista = criarLista("Nova Lista", []);
    wrapper.insertBefore(lista, wrapper.querySelector(".title-fixe"));
    salvarNoLocalStorage();
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".actions")) {
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
    const li = criarCard(card.nome, card.cor);
    ul.appendChild(li);
  });

  aplicarEdicaoTitulo(container);
  aplicarEventosAddFunction(container);

  return container;
}

function criarCard(nome = "Sem nome", cor = "#000000") {
  const li = document.createElement("li");
  li.className = "team-item";
  li.innerHTML = `
    <input type="color" class="color-picker" value="${cor}">
    <span class="team-name">${nome}</span>
    <div class="actions">
      <button class="menu-btn"><img src="../assets/Combined Shape.svg" alt=""></button>
      <div class="menu-options">
        <button class="edit-btn">Editar</button>
        <button class="delete-btn">Excluir</button>
      </div>
    </div>
  `;
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
    span.textContent = input.value.trim() || "Sem título";
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
    const card = criarCard("Novo time", "#000000");
    ul.appendChild(card);
    salvarNoLocalStorage();
  });
}

function aplicarEventosItem(item) {
  const menuBtn = item.querySelector(".menu-btn");
  const menu = item.querySelector(".menu-options");

  menuBtn.addEventListener("click", () => {
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });

  item.querySelector(".edit-btn").addEventListener("click", () => {
    const nameSpan = item.querySelector(".team-name");
    const input = document.createElement("input");
    input.type = "text";
    input.value = nameSpan.textContent;
    input.className = "edit-input";

    nameSpan.replaceWith(input);
    input.focus();

    input.addEventListener("blur", () => {
      const newSpan = document.createElement("span");
      newSpan.className = "team-name";
      newSpan.textContent = input.value || "Sem nome";
      input.replaceWith(newSpan);
      salvarNoLocalStorage();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.blur();
    });

    menu.style.display = "none";
  });

  item.querySelector(".delete-btn").addEventListener("click", () => {
    item.remove();
    salvarNoLocalStorage();
  });

  item.querySelector(".color-picker").addEventListener("input", () => {
    salvarNoLocalStorage();
  });
}

function salvarNoLocalStorage() {
  const listas = [];

  document.querySelectorAll(".team-container").forEach(container => {
    const titulo = container.querySelector(".team-title-text")?.textContent || "Sem título";
    const cards = [];
    container.querySelectorAll(".team-item").forEach(item => {
      const nome = item.querySelector(".team-name")?.textContent || "Sem nome";
      const cor = item.querySelector(".color-picker")?.value || "#000000";
      cards.push({ nome, cor });
    });
    if (cards.length > 0 || titulo !== "Nova Lista") {
      listas.push({ titulo, cards });
    }
  });

  localStorage.setItem("listas", JSON.stringify(listas));
}

function carregarDoLocalStorage() {
  const listasSalvas = JSON.parse(localStorage.getItem("listas")) || [];
  const wrapper = document.querySelector(".cards");
  const btn = wrapper.querySelector(".title-fixe");

  listasSalvas.forEach(lista => {
    const novaLista = criarLista(lista.titulo, lista.cards);
    wrapper.insertBefore(novaLista, btn);
  });
}