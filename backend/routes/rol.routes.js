const { Router } = require("express");
const controller = require("../controllers/rol.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/", controller.listRoles);
router.post("/", controller.createRol);
router.put("/:id", controller.updateRol);
router.delete("/:id", controller.deleteRol);

module.exports = router;
