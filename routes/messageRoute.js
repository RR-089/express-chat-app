const messageController = require("./../controllers/messageController");

const router = require("express").Router();

router.get("/:otherUserId", messageController.getMessages);

module.exports = router;
