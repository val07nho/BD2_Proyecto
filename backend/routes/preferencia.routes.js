const { Router } = require("express");
const controller = require("../controllers/preferencia.controller");

const router = Router();

router.get("/", controller.listPreferencias);
router.post("/", controller.createPreferencia);
router.put("/:idHuesped", controller.updatePreferencia);
router.delete("/:idHuesped", controller.deletePreferencia);

module.exports = router;
