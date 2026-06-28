const { Router } = require("express");
const controller = require("../controllers/servicio.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

const router = Router();

router.get("/", controller.listServicios);
router.post("/", requireAuth, requireRole("ADMIN"), controller.createServicio);
router.put("/:id", requireAuth, requireRole("ADMIN"), controller.updateServicio);
router.delete("/:id", requireAuth, requireRole("ADMIN"), controller.deleteServicio);

module.exports = router;
