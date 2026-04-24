const router = require("express").Router();
const ctrl = require("./inventory.controller");
// auth middleware sizda qanday bo‘lsa shuni qo‘ying:

router.get("/:entity/all", ctrl.getAll);
router.get("/:entity/froms", ctrl.getFroms);
router.get("/:entity/names", ctrl.getNames);
router.get("/:entity/entry-history", ctrl.getEntryHistory);
router.post("/:entity/create", ctrl.create);
router.put("/:entity/update/:id", ctrl.update);
router.delete("/:entity/delete/:id", ctrl.delete);

router.post("/:entity/return-out", ctrl.returnOut);
router.get("/:entity/returns", ctrl.getReturns);
router.delete("/:entity/returns/:id", ctrl.deleteReturn);

module.exports = router;
