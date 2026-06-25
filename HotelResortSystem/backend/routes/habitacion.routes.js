const { Router } = require("express");
const controller = require("../controllers/habitacion.controller");

const router = Router();

router.get("/", controller.listHabitaciones);
router.post("/", controller.createHabitacion);
router.put("/:id", controller.updateHabitacion);
router.delete("/:id", controller.deleteHabitacion);

module.exports = router;
