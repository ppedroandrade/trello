function mostrarLoading() {
  let bar = document.getElementById("top-loader");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "top-loader";
    bar.style = "position:fixed;top:0;left:0;height:4px;width:0;background:#007bff;z-index:9999;transition:width 0.3s;";
    document.body.appendChild(bar);
  }
  bar.style.width = "80%";
}

function esconderLoading() {
  const bar = document.getElementById("top-loader");
  if (bar) {
    bar.style.width = "100%";
    setTimeout(() => {
      bar.style.width = "0";
    }, 300);
  }
}

let projetoAtual = null;

document.addEventListener("DOMContentLoaded", async () => {
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

  async function atualizarSeletorProjetos() {
    mostrarLoading();
    try {
      const res = await axios.get("https://personal-ga2xwx9j.outsystemscloud.com/TrellospL/rest/Trello/GetBoards");
      const boards = res.data;
      console.log("Boards retornados:", boards);
      seletor.innerHTML = "";
      const defaultOpt = document.createElement("option");
      defaultOpt.textContent = "Selecione um projeto";
      defaultOpt.disabled = true;
      defaultOpt.selected = true;
      seletor.appendChild(defaultOpt);

      boards.forEach(board => {
        const opt = document.createElement("option");
        opt.value = board.Id;
        opt.textContent = board.Name || "(sem nome)";
        seletor.appendChild(opt);
      });

      if (boards.length > 0) {
        const ultimoProjeto = localStorage.getItem("projetoAtual");
        const projetoValido = boards.find(b => b.Id == ultimoProjeto);
        projetoAtual = projetoValido ? projetoValido.Id : boards[0].Id;
        seletor.value = projetoAtual;
        localStorage.setItem("projetoAtual", projetoAtual);
        await carregarDoLocalStorage();
      }
    } catch (err) {
      console.error("Erro ao carregar boards da API", err);
      mostrarToast("Erro ao carregar projetos.", "error");
    } finally {
      esconderLoading();
    }
  }

  seletor.addEventListener("change", async () => {
    projetoAtual = seletor.value;
    localStorage.setItem("projetoAtual", projetoAtual);
    await carregarDoLocalStorage();
  });

  novoProjetoBtn.addEventListener("click", async () => {
    const nome = prompt("Nome do novo projeto:");
    if (!nome) return;
    novoProjetoBtn.disabled = true;
    mostrarLoading();
    try {
      const res = await axios.post(
        "https://personal-ga2xwx9j.outsystemscloud.com/TrellospL/rest/Trello/CreateOrUpdateBoard",
        {
          Id: 0,
          Name: nome,
          Description: "",
          HexadecimalColor: ""
        },
        { headers: { "Content-Type": "application/json" } }
      );
      // O endpoint retorna o board criado/atualizado, pegue o Id
      const novoBoardId = res.data.Id || res.data;
      projetoAtual = novoBoardId;
      localStorage.setItem("projetoAtual", projetoAtual);
      await atualizarSeletorProjetos();
      seletor.value = projetoAtual;
      await carregarDoLocalStorage();
      mostrarToast("Projeto criado com sucesso!", "success");
    } catch (err) {
      console.error("Erro ao criar novo projeto na API", err);
      mostrarToast("Erro ao criar novo projeto.", "error");
    } finally {
      novoProjetoBtn.disabled = false;
      esconderLoading();
    }
  });

  await atualizarSeletorProjetos();

  botaoAdicionarLista.addEventListener("click", async () => {
    if (!projetoAtual) return;
    botaoAdicionarLista.disabled = true;
    mostrarLoading();
    try {
      const titulo = "Nova Lista";
      const colRes = await axios.post(
        "https://personal-ga2xwx9j.outsystemscloud.com/TrellospL/rest/Trello/CreateOrUpdateColumn",
        {
          Id: 0,
          BoardId: projetoAtual,
          Title: titulo
        },
        { headers: { "Content-Type": "application/json" } }
      );
      const columnId = colRes.data.Id || colRes.data;
      const lista = criarLista(titulo, []);
      lista.dataset.columnId = columnId;
      wrapper.insertBefore(lista, wrapper.querySelector(".title-fixe"));
      atualizarIndicadores(lista);
      mostrarToast("Lista criada com sucesso!", "success");
    } catch (err) {
      console.error("Erro ao criar nova lista na API", err);
      mostrarToast("Erro ao criar nova lista.", "error");
    } finally {
      botaoAdicionarLista.disabled = false;
      esconderLoading();
    }
  });

document.addEventListener("click", async (e) => {
  if (!e.target.closest(".menu-options") && !e.target.closest(".menu-btn")) {
    document.querySelectorAll(".menu-options").forEach(menu => {
      menu.style.display = "none";
    });
  }

  if (!e.target.closest(".team-item")) {
    const editedItems = document.querySelectorAll(".team-item[data-edited='true']");
    for (const item of editedItems) {
      const taskId = item.dataset.taskId ? parseInt(item.dataset.taskId) : 0;
      const columnId = item.closest(".team-container")?.dataset.columnId || 0;
      const nome = item.querySelector(".team-name")?.textContent || "Sem nome";
      const description = item.querySelector(".team-description")?.textContent || "Sem descrição";

      mostrarLoading();
      try {
        await axios.post(
          "https://personal-ga2xwx9j.outsystemscloud.com/TrellospL/rest/Trello/CreateOrUpdateTask",
          {
            Id: taskId,
            ColumnId: columnId,
            Title: nome,
            Description: description
          },
          { headers: { "Content-Type": "application/json" } }
        );
        item.removeAttribute("data-edited");
      } catch (err) {
        console.error("Erro ao atualizar tarefa na API", err);
        mostrarToast("Erro ao atualizar tarefa.", "error");
      } finally {
        esconderLoading();
      }
    }

    for (const container of document.querySelectorAll(".team-container")) {
      atualizarIndicadores(container);
    }
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
    if(card.Id) li.dataset.taskId = card.Id;
    ul.appendChild(li);
  });

  aplicarEdicaoTitulo(container);
  aplicarEventosAddFunction(container);

  new Sortable(ul, {
    group: 'cards',
    animation: 150,
    ghostClass: 'ghost-card',
    onEnd: async () => {
      await salvarNoLocalStorage();
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

  input.addEventListener("blur", async () => {
    const novoTitulo = input.value.trim();
    if (!novoTitulo) {
      input.style.display = "inline-block";
      input.focus();
      mostrarToast("O título da lista não pode estar vazio.", "error");
      return;
    }
    span.textContent = novoTitulo;
    span.style.display = "inline-block";
    input.style.display = "none";

    const columnId = container.dataset.columnId ? parseInt(container.dataset.columnId) : 0;
    mostrarLoading();
    try {
      const res = await axios.post(
        "https://personal-ga2xwx9j.outsystemscloud.com/TrellospL/rest/Trello/CreateOrUpdateColumn",
        {
          Id: columnId,
          BoardId: projetoAtual,
          Title: novoTitulo
        },
        { headers: { "Content-Type": "application/json" } }
      );
      container.dataset.columnId = res.data.Id || res.data;
      mostrarToast("Título da lista atualizado!", "success");
    } catch (err) {
      console.error("Erro ao atualizar coluna na API", err);
      mostrarToast("Erro ao atualizar título da lista.", "error");
    } finally {
      esconderLoading();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
  });

  // container.querySelector(".delete-btn").addEventListener("click", async () => {
  //   const columnId = container.dataset.columnId ? parseInt(container.dataset.columnId) : 0;
  //   if(columnId){
  //     mostrarLoading();
  //     try {
  //       await axios({
  //         method: 'delete',
  //         url: `https://personal-ga2xwx9j.outsystemscloud.com/TrellospL/rest/Trello/DeleteColumn`,
  //         params: { ColumnId: columnId },
  //         headers: {
  //           "Content-Type": "application/json"
  //         }
  //       });
  //       mostrarToast("Lista excluída com sucesso!", "success");
  //     } catch(err){
  //       console.error("Erro ao deletar coluna na API", err);
  //       mostrarToast("Erro ao excluir lista.", "error");
  //     } finally {
  //       esconderLoading();
  //     }
  //   }
  //   container.remove();
  // });
}

function aplicarEventosAddFunction(container) {
  const addBtn = container.querySelector(".add-function");
  const ul = container.querySelector(".team-list");

  addBtn.addEventListener("click", async () => {
    if (!projetoAtual) return;
    addBtn.disabled = true;
    mostrarLoading();
    const columnId = container.dataset.columnId ? parseInt(container.dataset.columnId) : 0;
    try {
      const res = await axios.post(
        "https://personal-ga2xwx9j.outsystemscloud.com/TrellospL/rest/Trello/CreateOrUpdateTask",
        {
          Id: 0,
          ColumnId: columnId,
          Title: "Novo Card",
          Description: "Sem descrição"
        },
        { headers: { "Content-Type": "application/json" } }
      );
      const taskId = res.data.Id || res.data;
      const card = criarCard("Novo Card", "Sem descrição");
      card.dataset.taskId = taskId;
      ul.appendChild(card);
      atualizarIndicadores(container);
      mostrarToast("Card criado com sucesso!", "success");
    } catch (err) {
      console.error("Erro ao criar novo card na API", err);
      mostrarToast("Erro ao criar novo card.", "error");
    } finally {
      addBtn.disabled = false;
      esconderLoading();
    }
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
    });

    nameInput.addEventListener("blur", () => {
      const newNameSpan = document.createElement("span");
      newNameSpan.className = "team-name";
      newNameSpan.textContent = nameInput.value || "Sem nome";
      nameInput.replaceWith(newNameSpan);
      item.setAttribute("data-edited", "true");
    });

    descInput.addEventListener("blur", () => {
      const newDescSpan = document.createElement("span");
      newDescSpan.className = "team-description";
      newDescSpan.textContent = descInput.value || "Sem descrição";
      descInput.replaceWith(newDescSpan);
      item.setAttribute("data-edited", "true");
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

  item.querySelector(".delete-btn").addEventListener("click", async () => {
    const taskId = item.dataset.taskId ? parseInt(item.dataset.taskId) : 0;
    if(taskId){
      mostrarLoading();
      try {
        await axios({
          method: 'delete',
          url: `https://personal-ga2xwx9j.outsystemscloud.com/TrellospL/rest/Trello/DeleteTask`,
          params: { TaskId: taskId },
          headers: {
            "Content-Type": "application/json"
          }
        });
        mostrarToast("Tarefa excluída com sucesso!", "success");
      } catch(err){
        console.error("Erro ao deletar tarefa na API", err);
        mostrarToast("Erro ao excluir tarefa.", "error");
      } finally {
        esconderLoading();
      }
    }
    item.remove();
  });
}

async function salvarNoLocalStorage() {
  if (!projetoAtual) return;
  mostrarLoading();
  try {
    const containers = document.querySelectorAll(".team-container");
    for (const container of containers) {
      const titulo = container.querySelector(".team-title-text")?.textContent.trim() || "";
      if (!titulo) continue;

      const columnId = container.dataset.columnId ? parseInt(container.dataset.columnId) : 0;
      try {
        const colRes = await axios.post(
          "https://personal-ga2xwx9j.outsystemscloud.com/TrellospL/rest/Trello/CreateOrUpdateColumn",
          {
            Id: columnId,
            BoardId: projetoAtual,
            Title: titulo
          },
          { headers: { "Content-Type": "application/json" } }
        );
        container.dataset.columnId = colRes.data.Id || colRes.data;
      } catch (err) {
        console.error("Erro ao salvar coluna na API", err);
        mostrarToast("Erro ao salvar coluna.", "error");
        continue;
      }

      const cards = container.querySelectorAll(".team-item");
      for (const item of cards) {
        const taskId = item.dataset.taskId ? parseInt(item.dataset.taskId) : 0;
        const nome = item.querySelector(".team-name")?.textContent || "Sem nome";
        const description = item.querySelector(".team-description")?.textContent || "Sem descrição";

        try {
          const taskRes = await axios.post(
            "https://personal-ga2xwx9j.outsystemscloud.com/TrellospL/rest/Trello/CreateOrUpdateTask",
            {
              Id: taskId,
              ColumnId: container.dataset.columnId ? parseInt(container.dataset.columnId) : 0,
              Title: nome,
              Description: description
            },
            { headers: { "Content-Type": "application/json" } }
          );
          item.dataset.taskId = taskRes.data.Id || taskRes.data;
        } catch (err) {
          console.error("Erro ao salvar tarefa na API", err);
          mostrarToast("Erro ao salvar tarefa.", "error");
        }
      }
    }
  } finally {
    esconderLoading();
  }
}

async function carregarDoLocalStorage() {
  if (!projetoAtual) return;
  mostrarLoading();
  try {
    const wrapper = document.querySelector(".cards");
    const btn = wrapper.querySelector(".title-fixe");

    document.querySelectorAll(".team-container").forEach(c => {
      if (!c.classList.contains("title-fixe")) c.remove();
    });

    try {
      const res = await axios.get(
        `https://personal-ga2xwx9j.outsystemscloud.com/TrellospL/rest/Trello/GetCompleteBoard?BoardId=${projetoAtual}`,
        { headers: { "Content-Type": "application/json" } }
      );
      const board = res.data;

      board.ColumnStrs.forEach(coluna => {
        const cards = (coluna.Tasks || []).map(t => ({
          Id: t.Id,
          nome: t.Title,
          description: t.Description,
          image: "",
          priority: ""
        }));

        const novaLista = criarLista(coluna.Column.Title, cards);
        novaLista.dataset.columnId = coluna.Column.Id;
        wrapper.insertBefore(novaLista, btn);
      });
    } catch (err) {
      console.error("Erro ao carregar dados da API", err);
      mostrarToast("Erro ao carregar listas e cards.", "error");
    }
  } finally {
    esconderLoading();
  }
}
// Toast function and CSS injection
function mostrarToast(mensagem, tipo = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${tipo}`;
  toast.textContent = mensagem;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

(function injectToastCss() {
  if (document.getElementById("toast-css-style")) return;
  const style = document.createElement("style");
  style.id = "toast-css-style";
  style.innerHTML = `
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #333;
  color: white;
  padding: 10px 16px;
  border-radius: 5px;
  opacity: 0;
  pointer-events: none;
  transform: translateY(20px);
  transition: opacity 0.3s, transform 0.3s;
  z-index: 10000;
}
.toast.show {
  opacity: 1;
  transform: translateY(0);
}
.toast-success { background: #28a745; }
.toast-error { background: #dc3545; }
.toast-info { background: #007bff; }
`;
  document.head.appendChild(style);
})();