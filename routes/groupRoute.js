const groupController = require("./../controllers/groupController");

const router = require("express").Router();

router.get("/", groupController.getGroups);
router.get("/:groupId/messages", groupController.getGroupMessages);
router.post("/", groupController.createGroup);

module.exports = router;
