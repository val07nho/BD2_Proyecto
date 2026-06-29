const { Router } = require("express");
const controller = require("../controllers/reserva.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

const router = Router();

router.use(requireAuth);

router.get("/", controller.listReservas);
router.post("/", controller.createReserva);
router.post("/:id/pagar", controller.pagarReserva);
router.post("/:id/cancelar", controller.cancelarReserva);
router.post("/:id/finalizar", controller.finalizarReserva);
router.put("/:id", requireRole("ADMIN", "GERENTE"), controller.updateReserva);
router.delete("/:id", requireRole("ADMIN"), controller.deleteReserva);

module.exports = router;
