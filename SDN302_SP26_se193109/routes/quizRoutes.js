const express = require("express");
const authenticate = require('../middleware/authenticate');
const router = express.Router();
const controller = require("../controllers/quizController");

// GET all quizzes (public)
router.get("/", controller.getAllQuiz);

// GET quizzes owned by the logged-in user
router.get("/my/list", authenticate.verifyUser, controller.getMyQuizzes);

// GET single quiz (public)
router.get("/:quizId", controller.getQuizById);

// CREATE quiz (only admin)
router.post("/", authenticate.verifyUser, authenticate.verifyAdmin, controller.createQuiz);

// UPDATE quiz (only admin)
router.put("/:quizId", authenticate.verifyUser, authenticate.verifyAdmin, controller.updateQuiz);

// DELETE quiz (only admin)
router.delete("/:quizId", authenticate.verifyUser, authenticate.verifyAdmin, controller.deleteQuiz);

// GET quiz by keyword
router.get("/:quizId/populate", controller.getQuizByKeyword);

// ADD multiple questions to quiz (only the quiz owner)
router.post("/:quizId/questions", authenticate.verifyUser, authenticate.verifyQuizOwner, controller.addManyQuestions);

// DELETE question from quiz (only the quiz owner)
router.delete(
  "/:quizId/questions/:questionId",
  authenticate.verifyUser,
  authenticate.verifyQuizOwner,
  controller.deleteQuestionInQuiz,
);

// ADD single question to quiz (only the quiz owner)
router.post("/:quizId/question", authenticate.verifyUser, authenticate.verifyQuizOwner, controller.addQuestionToQuiz);

module.exports = router;
