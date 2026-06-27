const { Router } = require("express");
const controller = require("../controllers/rol.controller");

const router = Router();

router.get("/", controller.listRoles);
router.post("/", controller.createRol);
router.put("/:id", controller.updateRol);
router.delete("/:id", controller.deleteRol);

module.exports = router;
