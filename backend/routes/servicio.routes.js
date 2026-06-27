const { Router } = require("express");
const controller = require("../controllers/servicio.controller");

const router = Router();

router.get("/", controller.listServicios);
router.post("/", controller.createServicio);
router.put("/:id", controller.updateServicio);
router.delete("/:id", controller.deleteServicio);

module.exports = router;
