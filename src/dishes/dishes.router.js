const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./dishes.controller");

//Route reading and updating via dishId
router.route("/:dishId").get(controller.read).put(controller.update).all(methodNotAllowed);

//Route creating a dish and showing list of dishes
router.route("/").get(controller.list).post(controller.create).all(methodNotAllowed);

module.exports = router;