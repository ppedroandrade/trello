document.addEventListener("DOMContentLoaded", function () {
  const editBtn = document.getElementById("edit-title-btn");
  const titleText = document.getElementById("team-title-text");
  const titleInput = document.getElementById("team-title-input");

  // Ao clicar no botão (⋮), troca o texto pelo input
  editBtn.addEventListener("click", () => {
    titleInput.value = titleText.textContent.trim();
    titleText.style.display = "none";
    titleInput.style.display = "inline-block";
    titleInput.focus();
  });

  // Quando o input perde o foco, salva o texto e volta para o span
  titleInput.addEventListener("blur", () => {
    titleText.textContent = titleInput.value.trim() || "Sem título";
    titleInput.style.display = "none";
    titleText.style.display = "inline-block";
  });

  // Se apertar Enter, faz o mesmo que blur
  titleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      titleInput.blur();
    }
  });
});