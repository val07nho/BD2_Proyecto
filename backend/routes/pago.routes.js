const { Router } = require("express");
const controller = require("../controllers/pago.controller");

const router = Router();

router.get("/", controller.listPagos);
router.post("/", controller.createPago);
router.put("/:id", controller.updatePago);
router.delete("/:id", controller.deletePago);

module.exports = router;
