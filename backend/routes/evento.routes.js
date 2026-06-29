const { Router } = require("express");
const controller = require("../controllers/evento.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

const router = Router();

router.get("/", controller.listEventos);
router.get("/mis-reservas", requireAuth, controller.getMisEventos);
router.post("/adquirir", requireAuth, controller.adquirirEvento);
router.post("/", requireAuth, requireRole("ADMIN"), controller.createEvento);
router.put("/:id", requireAuth, requireRole("ADMIN"), controller.updateEvento);
router.delete("/:id", requireAuth, requireRole("ADMIN"), controller.deleteEvento);

module.exports = router;
