const { Router } = require("express");
const controller = require("../controllers/reserva.controller");

const router = Router();

router.get("/", controller.listReservas);
router.post("/", controller.createReserva);
router.put("/:id", controller.updateReserva);
router.delete("/:id", controller.deleteReserva);

module.exports = router;
