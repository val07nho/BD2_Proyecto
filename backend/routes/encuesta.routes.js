const { Router } = require("express");
const controller = require("../controllers/encuesta.controller");

const router = Router();

router.get("/", controller.listEncuestas);
router.post("/", controller.createEncuesta);
router.delete("/:id", controller.deleteEncuesta);

module.exports = router;
