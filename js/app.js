document.addEventListener("DOMContentLoaded", function () {
  const editBtn = document.getElementById("edit-title-btn");
  const titleText = document.getElementById("team-title-text");
  const titleInput = document.getElementById("team-title-input");

  // Carrega dados salvos
  carregarTituloPrincipal();
  carregarTimes();

  // Editar o título principal
  editBtn.addEventListener("click", () => {
    titleInput.value = titleText.textContent.trim();
    titleText.style.display = "none";
    titleInput.style.display = "inline-block";
    titleInput.focus();
  });

  titleInput.addEventListener("blur", () => {
    const novoTitulo = titleInput.value.trim() || "Sem título";
    titleText.textContent = novoTitulo;
    titleInput.style.display = "none";
    titleText.style.display = "inline-block";
    localStorage.setItem("titulo_principal", novoTitulo);
  });

  titleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") titleInput.blur();
  });

  // Criar novo item
  document.querySelector(".add-function").addEventListener("click", () => {
    const ul = document.querySelector(".team-list");

    const li = document.createElement("li");
    li.className = "team-item";
    li.innerHTML = `
      <input type="color" class="color-picker" value="#000000">
      <span class="team-name">Novo time</span>
      <div class="actions">
        <button class="menu-btn"><img src="../assets/Combined Shape.svg" alt=""></button>
        <div class="menu-options">
          <button class="edit-btn">Editar</button>
          <button class="delete-btn">Excluir</button>
        </div>
      </div>
    `;

    ul.appendChild(li);
    aplicarEventosItem(li);
    salvarTimes();
  });

  // Fecha menus se clicar fora
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".actions")) {
      document.querySelectorAll(".menu-options").forEach(menu => {
        menu.style.display = "none";
      });
    }
  });
});

function aplicarEventosItem(item) {
  const colorPicker = item.querySelector(".color-picker");
  let tag = item.querySelector(".tag");

  // Cria a tag visual se ainda não existir
  if (!tag) {
    tag = document.createElement("span");
    tag.className = "tag";
    tag.style.backgroundColor = colorPicker.value;
    colorPicker.insertAdjacentElement("afterend", tag);
  }

  // Atualiza a cor visual quando mudar o input
  colorPicker.addEventListener("input", () => {
    tag.style.backgroundColor = colorPicker.value;
    salvarTimes();
  });

  // Menu de opções
  const menuBtn = item.querySelector(".menu-btn");
  const menuOptions = item.querySelector(".menu-options");

  menuBtn.addEventListener("click", () => {
    document.querySelectorAll(".menu-options").forEach(menu => {
      if (menu !== menuOptions) menu.style.display = "none";
    });
    menuOptions.style.display = menuOptions.style.display === "block" ? "none" : "block";
  });

  // Excluir item
  item.querySelector(".delete-btn").addEventListener("click", () => {
    item.remove();
    salvarTimes();
  });

  // Editar nome
  item.querySelector(".edit-btn").addEventListener("click", () => {
    const nameSpan = item.querySelector(".team-name");
    const input = document.createElement("input");
    input.type = "text";
    input.value = nameSpan.textContent.trim();
    input.className = "edit-input";

    nameSpan.replaceWith(input);
    input.focus();

    input.addEventListener("blur", () => {
      const newSpan = document.createElement("span");
      newSpan.className = "team-name";
      newSpan.textContent = input.value || "Sem nome";
      input.replaceWith(newSpan);
      salvarTimes();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.blur();
    });

    menuOptions.style.display = "none";
  });
}

// Salva os times no localStorage
function salvarTimes() {
  const times = [];
  document.querySelectorAll(".team-item").forEach(item => {
    const nome = item.querySelector(".team-name")?.textContent || "Sem nome";
    const cor = item.querySelector(".color-picker")?.value || "#000000";
    times.push({ nome, cor });
  });
  localStorage.setItem("times", JSON.stringify(times));
}

// Carrega os times do localStorage
function carregarTimes() {
  const times = JSON.parse(localStorage.getItem("times")) || [];
  const ul = document.querySelector(".team-list");
  ul.innerHTML = "";

  times.forEach(time => {
    const li = document.createElement("li");
    li.className = "team-item";
    li.innerHTML = `
      <input type="color" class="color-picker" value="${time.cor}">
      <span class="team-name">${time.nome}</span>
      <div class="actions">
        <button class="menu-btn"><img src="../assets/Combined Shape.svg" alt=""></button>
        <div class="menu-options">
          <button class="edit-btn">Editar</button>
          <button class="delete-btn">Excluir</button>
        </div>
      </div>
    `;
    ul.appendChild(li);
    aplicarEventosItem(li);
  });
}

// Carrega o título principal
function carregarTituloPrincipal() {
  const salvo = localStorage.getItem("titulo_principal");
  if (salvo) {
    document.getElementById("team-title-text").textContent = salvo;
  }
}