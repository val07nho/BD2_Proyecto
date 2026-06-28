const { Router } = require("express");
const controller = require("../controllers/habitacion.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

const router = Router();

router.get("/", controller.listHabitaciones);
router.post("/", requireAuth, requireRole("ADMIN"), controller.createHabitacion);
router.put("/:id", requireAuth, requireRole("ADMIN"), controller.updateHabitacion);
router.delete("/:id", requireAuth, requireRole("ADMIN"), controller.deleteHabitacion);

module.exports = router;
