const { Router } = require("express");
const controller = require("../controllers/factura.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

const router = Router();

router.use(requireAuth);

router.get("/", controller.listFacturas);
router.get("/:id/detalle", controller.getFacturaDetalle);
router.post("/", requireRole("ADMIN", "GERENTE"), controller.createFactura);
router.put("/:id", requireRole("ADMIN", "GERENTE"), controller.updateFactura);
router.delete("/:id", requireRole("ADMIN"), controller.deleteFactura);

module.exports = router;
