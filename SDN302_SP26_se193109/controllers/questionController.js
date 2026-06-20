const Question = require("../models/questionModel");
const Quiz = require("../models/quizModel");

// 1. GET ALL QUESTIONS (Đã sửa lại $project để giữ lại trường author)
exports.getAllQuestions = async (req, res, next) => {
  try {
    const questions = await Question.aggregate([
      {
        $lookup: {
          from: Quiz.collection.name, 
          localField: "_id", 
          foreignField: "questions", 
          as: "quizInfo", 
        },
      },
      {
        $unwind: {
          path: "$quizInfo",
          preserveNullAndEmptyArrays: true, 
        },
      },
      {
        $project: {
          _id: 1,
          text: 1,
          options: 1,
          keywords: 1,
          correctAnswerIndex: 1,
          author: 1, 
          quizTitle: { $ifNull: ["$quizInfo.title", "Chưa gán vào Quiz"] },
        },
      },
    ]);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(questions);
  } catch (err) {
    next(err); // Thay vì console.log, đẩy qua next để Express xử lý lỗi tập trung
  }
};

// 2. CREATE QUESTION (Đã chuẩn chỉnh)
exports.createQuestion = async (req, res, next) => {
    try {
        // Gán id của tài khoản đang đăng nhập vào trường author
        req.body.author = req.user._id;
        
        const question = await Question.create(req.body);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(question);
    } catch (err) {
        next(err);
    }
};

// 3. GET QUESTION BY ID (Thêm try/catch và chuẩn hóa response)
exports.getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.questionId).populate('author'); // Thêm populate để xem rõ thông tin người tạo

    if (!question) {
        const err = new Error('Question not found');
        err.status = 404;
        return next(err);
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(question);
  } catch (err) {
      next(err); // Bắt các lỗi lỗi như Sai định dạng ID (CastError)
  }
};

// 4. UPDATE QUESTION (Thêm try/catch và bọc $set an toàn)
exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.questionId,
      { $set: req.body }, // Dùng $set để cập nhật các trường được gửi lên một cách an toàn
      { new: true },
    );

    if (!question) {
        const err = new Error('Question not found');
        err.status = 404;
        return next(err);
    }
    if (!question.author.equals(req.user._id)) {
        const err = new Error('You are not authorized to perform this operation!');
        err.status = 403; // Mã 403: Forbidden
        return next(err); 
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(question);
  } catch (err) {
      next(err);
  }
};

// 5. DELETE QUESTION (Thêm try/catch bảo vệ hệ thống)
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.questionId);

    if (!question) {
        const err = new Error('Question not found');
        err.status = 404;
        return next(err);
    }
    if (!question.author.equals(req.user._id)) {
        const err = new Error('You are not authorized to perform this operation!');
        err.status = 403; // Mã 403: Forbidden
        return next(err); 
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
      message: "Question deleted",
      id: req.params.questionId
    });
  } catch (err) {
      next(err);
  }
};