let projetoAtual = localStorage.getItem("projetoAtual") || "Projeto Principal";

document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".cards");
  const botaoAdicionarLista = document.querySelector(".add-list");

  if (localStorage.getItem("tema") === "dark") {
    document.body.classList.add("dark-mode");
  }

  const toggleBtn = document.querySelector(".theme-toggle");
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("tema", document.body.classList.contains("dark-mode") ? "dark" : "light");
  });

  const seletor = document.querySelector(".project-selector");
  const novoProjetoBtn = document.querySelector(".new-project-btn");

  function atualizarSeletorProjetos() {
    const projetos = JSON.parse(localStorage.getItem("projetos")) || {};
    seletor.innerHTML = "";

    Object.keys(projetos).forEach(nome => {
      const opt = document.createElement("option");
      opt.value = nome;
      opt.textContent = nome;
      if (nome === projetoAtual) opt.selected = true;
      seletor.appendChild(opt);
    });
  }

  seletor.addEventListener("change", () => {
    projetoAtual = seletor.value;
    localStorage.setItem("projetoAtual", projetoAtual);
    carregarDoLocalStorage();
  });

  novoProjetoBtn.addEventListener("click", () => {
    const nome = prompt("Nome do novo projeto:");
    if (!nome) return;
    const projetos = JSON.parse(localStorage.getItem("projetos")) || {};
    if (!projetos[nome]) projetos[nome] = [];
    localStorage.setItem("projetos", JSON.stringify(projetos));
    projetoAtual = nome;
    localStorage.setItem("projetoAtual", projetoAtual);
    atualizarSeletorProjetos();
    carregarDoLocalStorage();
  });

  atualizarSeletorProjetos();
  carregarDoLocalStorage();

  botaoAdicionarLista.addEventListener("click", () => {
    const lista = criarLista("Nova Lista", []);
    wrapper.insertBefore(lista, wrapper.querySelector(".title-fixe"));
    salvarNoLocalStorage();
  });

document.addEventListener("click", (e) => {
  if (!e.target.closest(".menu-options") && !e.target.closest(".menu-btn")) {
    document.querySelectorAll(".menu-options").forEach(menu => {
      menu.style.display = "none";
    });
  }

  if (!e.target.closest(".team-item")) {
    document.querySelectorAll(".team-item").forEach(item => {
      const nameInput = item.querySelector("input.edit-input[type='text']");
      const descInput = item.querySelector("textarea.edit-input");
      const prioritySelect = item.querySelector("select.edit-input");
      const imageInput = item.querySelector("input[type='file'].edit-input");

      if (nameInput) {
        const span = document.createElement("span");
        span.className = "team-name";
        span.textContent = nameInput.value || "Sem nome";
        nameInput.replaceWith(span);
      }

      if (descInput) {
        const span = document.createElement("span");
        span.className = "team-description";
        span.textContent = descInput.value || "Sem descrição";
        descInput.replaceWith(span);
      }

      if (prioritySelect) {
        item.querySelector(".priority-label")?.remove();
        if (prioritySelect.value) {
          const tag = document.createElement("div");
          tag.className = `priority-label priority-${prioritySelect.value.toLowerCase()}`;
          item.prepend(tag);
        }
        prioritySelect.remove();
      }

      if (imageInput) {
        imageInput.remove();
      }
    });

    salvarNoLocalStorage();
  }
});
});

function atualizarIndicadores(container) {
  const ul = container.querySelector(".team-list");
  const total = ul.querySelectorAll(".team-item").length;
  const alta = ul.querySelectorAll(".priority-label.priority-alta").length;

  let indicador = container.querySelector(".team-indicator");
  if (!indicador) {
    indicador = document.createElement("div");
    indicador.className = "team-indicator";
    container.insertBefore(indicador, ul);
  }

  indicador.textContent = `Total: ${total} | Alta prioridade: ${alta}`;
}

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
    <div class="team-indicator"></div>
    <ul class="team-list"></ul>
    <div class="add-function">+ Adicionar um cartão</div>
  `;

  const ul = container.querySelector(".team-list");

  cards.forEach(card => {
    const li = criarCard(card.nome, card.description, card.image, card.priority);
    ul.appendChild(li);
  });

  aplicarEdicaoTitulo(container);
  aplicarEventosAddFunction(container);

  new Sortable(ul, {
    group: 'cards',
    animation: 150,
    ghostClass: 'ghost-card',
    onEnd: () => {
      salvarNoLocalStorage();
      atualizarIndicadores(container);
    }
  });

  atualizarIndicadores(container);
  return container;
}

function criarCard(nome = "Sem nome", description = "Sem descrição", image = "", priority = "") {
  const li = document.createElement("li");
  li.className = "team-item";

  const priorityClass = priority ? `priority-${priority.toLowerCase()}` : "";

  li.innerHTML = `
    ${priority ? `<div class="priority-label ${priorityClass}"></div>` : ""}
    ${image ? `<img src="${image}" class="card-image" />` : ""}
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
    atualizarIndicadores(container);
  });
}

function aplicarEventosItem(item) {
  const menuBtn = item.querySelector(".menu-btn");
  const menu = item.querySelector(".menu-options");

  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".menu-options").forEach(m => m.style.display = "none");

    if (menu.style.display === "block") {
      menu.style.display = "none";
      return;
    }

    const btnRect = menuBtn.getBoundingClientRect();
    menu.style.position = "fixed";
    menu.style.top = `${btnRect.bottom + window.scrollY}px`;
    menu.style.left = `${btnRect.left}px`;
    menu.style.display = "block";
  });

  item.querySelector(".edit-btn").addEventListener("click", () => {
    const nameSpan = item.querySelector(".team-name");
    const descSpan = item.querySelector(".team-description");

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = nameSpan.textContent;
    nameInput.className = "edit-input";

    const descInput = document.createElement("textarea");
    descInput.value = descSpan.textContent;
    descInput.className = "edit-input";

    nameSpan.replaceWith(nameInput);
    descSpan.replaceWith(descInput);

    // PRIORIDADE
    const prioritySelect = document.createElement("select");
    prioritySelect.className = "edit-input";
    prioritySelect.innerHTML = `
      <option value="">Sem prioridade</option>
      <option value="Alta">Alta</option>
      <option value="Média">Média</option>
      <option value="Baixa">Baixa</option>
    `;
    const currentPriority = item.querySelector(".priority-label")?.classList[1]?.split("-")[1];
    if (currentPriority) {
      prioritySelect.value = currentPriority.charAt(0).toUpperCase() + currentPriority.slice(1);
    }
    item.querySelector(".name-description").appendChild(prioritySelect);

    // IMAGEM
    const imageInput = document.createElement("input");
    imageInput.type = "file";
    imageInput.accept = "image/*";
    imageInput.className = "edit-input";
    item.querySelector(".name-description").appendChild(imageInput);

    imageInput.addEventListener("change", () => {
      const file = imageInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const existingImage = item.querySelector(".card-image");
        if (existingImage) {
          existingImage.src = reader.result;
        } else {
          const img = document.createElement("img");
          img.src = reader.result;
          img.className = "card-image";
          item.prepend(img);
        }
        salvarNoLocalStorage();
      };
      reader.readAsDataURL(file);
    });

    prioritySelect.addEventListener("change", () => {
      item.querySelector(".priority-label")?.remove();

      if (prioritySelect.value) {
        const tag = document.createElement("div");
        tag.className = `priority-label priority-${prioritySelect.value.toLowerCase()}`;
        item.prepend(tag);
      }

      salvarNoLocalStorage();
    });

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
      const image = item.querySelector(".card-image")?.src || "";
      const priorityClass = item.querySelector(".priority-label")?.classList[1] || "";
      const priority = priorityClass.split("-")[1]?.charAt(0).toUpperCase() + priorityClass.split("-")[1]?.slice(1) || "";

      cards.push({ nome, description, image, priority });
    });

    listas.push({ titulo, cards });
  });

  const projetos = JSON.parse(localStorage.getItem("projetos")) || {};
  projetos[projetoAtual] = listas;
  localStorage.setItem("projetos", JSON.stringify(projetos));
}

function carregarDoLocalStorage() {
  const projetos = JSON.parse(localStorage.getItem("projetos")) || {};
  const listasSalvas = projetos[projetoAtual] || [];
  const wrapper = document.querySelector(".cards");
  const btn = wrapper.querySelector(".title-fixe");

  document.querySelectorAll(".team-container").forEach(c => {
    if (!c.classList.contains("title-fixe")) c.remove();
  });

  listasSalvas.forEach(lista => {
    if (!lista.titulo || lista.titulo.trim() === "") return;
    const novaLista = criarLista(lista.titulo, lista.cards);
    wrapper.insertBefore(novaLista, btn);
  });
}