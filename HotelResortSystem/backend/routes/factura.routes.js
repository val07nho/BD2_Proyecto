const { Router } = require("express");
const controller = require("../controllers/factura.controller");

const router = Router();

router.get("/", controller.listFacturas);
router.post("/", controller.createFactura);
router.put("/:id", controller.updateFactura);
router.delete("/:id", controller.deleteFactura);

module.exports = router;
