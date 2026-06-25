const API_BASE = "http://localhost:4000/api";

async function fetchApi(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error en solicitud");
  }

  return response.json();
}

function renderTable(tbodyId, rows, columns) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  tbody.innerHTML = rows
    .map((row) => {
      const cells = columns.map((col) => `<td>${row[col] ?? ""}</td>`).join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
}

function attachSubmit(formId, callback) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      await callback(data);
      form.reset();
      alert("Operacion exitosa");
    } catch (error) {
      alert(error.message);
    }
  });
}
