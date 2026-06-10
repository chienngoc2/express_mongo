const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate'); // Import middleware xác thực
const controller = require("../controllers/questionController"); // Import controller

// ==========================================
// THAO TÁC TRÊN ĐƯỜNG DẪN GỐC: /questions
// ==========================================
router.route('/')
.get(controller.getAllQuestions) // Ai cũng có quyền GET xem danh sách câu hỏi công khai
.post(authenticate.verifyUser, controller.createQuestion); // BẮT BUỘC ĐĂNG NHẬP mới được tạo câu hỏi mới

// ==========================================
// THAO TÁC TRÊN ĐƯỜNG DẪN CÓ ID: /questions/:questionId
// ==========================================
router.route('/:questionId')
.get(controller.getQuestionById) 
.put(authenticate.verifyUser, authenticate.verifyAuthor, controller.updateQuestion)
.delete(authenticate.verifyUser, authenticate.verifyAuthor, controller.deleteQuestion);

module.exports = router;