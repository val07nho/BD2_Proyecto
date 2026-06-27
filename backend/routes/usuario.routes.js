const { Router } = require("express");
const controller = require("../controllers/usuario.controller");

const router = Router();

router.get("/", controller.listUsuarios);
router.post("/", controller.createUsuario);
router.put("/:id", controller.updateUsuario);
router.delete("/:id", controller.deleteUsuario);

module.exports = router;
