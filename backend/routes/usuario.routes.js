const { Router } = require("express");
const controller = require("../controllers/usuario.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/", controller.listUsuarios);
router.post("/", controller.createUsuario);
router.put("/:id", controller.updateUsuario);
router.delete("/:id", controller.deleteUsuario);

module.exports = router;
