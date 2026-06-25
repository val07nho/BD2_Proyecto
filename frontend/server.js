const express = require("express");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = process.env.FRONTEND_PORT || 3000;

// Servir todos los archivos estáticos del directorio actual (frontend/)
app.use(express.static(path.join(__dirname)));

// Ruta por defecto redirige al dashboard
app.get("/", (req, res) => {
  res.redirect("/dashboard.html");
});

app.listen(PORT, () => {
  const url = `http://localhost:${PORT}/dashboard.html`;
  console.log(`Frontend HRMS disponible en http://localhost:${PORT}`);
  console.log(`Abriendo navegador en ${url}...`);

  // Abrir navegador automáticamente según el sistema operativo
  const cmd =
    process.platform === "win32"
      ? `start ${url}`
      : process.platform === "darwin"
      ? `open ${url}`
      : `xdg-open ${url}`;

  exec(cmd);
});
