const { Router } = require("express");
const PosterController = require("./poster.controller");
const {upload} = require("../../common/utils/multer");
const posterController = require("./poster.controller");
const Authorization = require("../../common/guard/authorization.guard");

const router = Router()
router.get("/create", Authorization, PosterController.createPosterPage)
router.post("/create", Authorization, upload.array("images", 10), PosterController.create)
router.get("/my", Authorization, posterController.findMyPosts)
router.delete("/delete/:id", Authorization, posterController.remove)
router.get("/:id", posterController.showPost)

module.exports = {
    PosterRouter: router
}