document.addEventListener('DOMContentLoaded', function () {
  const editBtn = document.getElementById("edit-title-btn");
  const titleText = document.getElementById("team-title-text");
  const titleInput = document.getElementById("team-title-input");

  editBtn.addEventListener("click", () => {
    titleInput.value = titleText.textContent;
    titleText.style.display = "none";
    titleInput.style.display = "inline-block";
    titleInput.focus();
  });

  titleInput.addEventListener("blur", () => {
    titleText.textContent = titleInput.value;
    titleInput.style.display = "none";
    titleText.style.display = "inline-block";
  });

  titleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      titleInput.blur();
    }
  });

  // Atualiza a cor da tag quando o color picker muda
  const colorPickers = document.querySelectorAll(".color-picker");
  colorPickers.forEach(picker => {
    picker.addEventListener("input", (e) => {
      const tag = e.target.nextElementSibling;
      tag.style.backgroundColor = e.target.value;
      if (tag.classList.contains("tag")) {
        tag.style.color = e.target.value === "#ffffff" ? "#000000" : "#ffffff";
      }
    });
  });
});