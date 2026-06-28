const { Router } = require("express");
const controller = require("../controllers/huesped.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

const router = Router();

router.use(requireAuth);

router.get("/", controller.listHuespedes);
router.post("/", requireRole("ADMIN"), controller.createHuesped);
router.put("/:id", controller.updateHuesped);
router.delete("/:id", requireRole("ADMIN"), controller.deleteHuesped);

module.exports = router;
