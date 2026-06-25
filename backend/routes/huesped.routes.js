const { Router } = require("express");
const controller = require("../controllers/huesped.controller");

const router = Router();

router.get("/", controller.listHuespedes);
router.post("/", controller.createHuesped);
router.put("/:id", controller.updateHuesped);
router.delete("/:id", controller.deleteHuesped);

module.exports = router;
