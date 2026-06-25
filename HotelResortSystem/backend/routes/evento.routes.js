const { Router } = require("express");
const controller = require("../controllers/evento.controller");

const router = Router();

router.get("/", controller.listEventos);
router.post("/", controller.createEvento);
router.put("/:id", controller.updateEvento);
router.delete("/:id", controller.deleteEvento);

module.exports = router;
