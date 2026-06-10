const Quiz = require("../models/quizModel");
const authenticate = require('../middleware/authenticate');
const Question = require("../models/questionModel");

// GET all quizzes (public - for the quiz-taking list)
exports.getAllQuiz = async (req, res) => {
  const quizzes = await Quiz.find().populate("questions").populate("author", "username");
  res.json(quizzes);
};

exports.createQuiz = async (req, res, next) => {
    try {
        // Tự động gán author là người đang đăng nhập
        const quizData = { ...req.body, author: req.user._id };
        const quiz = await Quiz.create(quizData);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(quiz);
    } catch (err) {
        next(err);
    }
};

// GET quizzes owned by the logged-in user
exports.getMyQuizzes = async (req, res, next) => {
    try {
        const quizzes = await Quiz.find({ author: req.user._id }).populate("questions").lean();
        res.json(quizzes);
    } catch (err) {
        next(err);
    }
};

// GET quiz by id
exports.getQuizById = async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId).populate("questions");

  // không tìm thấy quiz
  if (!quiz) {
    return res.status(404).json("Quiz not found");
  }

  res.json(quiz);
};


// UPDATE quiz
exports.updateQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.quizId, 
            { $set: req.body }, 
            { new: true }//  trả về dữ liệu MỚI sau khi đã sửa đổi
        );
        if (!quiz) {
            const err = new Error('Quiz not found');
            err.status = 404;
            return next(err);
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(quiz);
    } catch (err) {
        next(err);
    }
};

// DELETE quiz


exports.deleteQuiz = async (req, res, next) => {
    try {
        // Tìm quiz
        const quiz = await Quiz.findById(req.params.quizId);
        
        if (!quiz) {
            const err = new Error('Quiz not found');
            err.status = 404;
            return next(err);
        }

        // Xóa tất cả question trong quiz
        await Question.deleteMany({
            _id: { $in: quiz.questions },
        });

        // Xóa quiz
        await Quiz.findByIdAndDelete(req.params.quizId);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ message: "Quiz and related questions deleted" });
    } catch (err) {
        next(err); // Đẩy lỗi ra middleware xử lý lỗi của Express
    }
};

// GET populate keyword capital
exports.getQuizByKeyword = async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId).populate({
    path: "questions",

    match: {
      keywords: "capital",
    },
  });

  // không tìm thấy quiz
  if (!quiz) {
    return res.status(404).json("Quiz not found");
  }

  res.json(quiz);
};

exports.addQuestionToQuiz = async (req, res, next) => { // Thêm next ở đây
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
        const err = new Error("Quiz not found");
        err.status = 404;
        return next(err);
    }

    const existingId = req.body._id || req.body.questionId;

    if (existingId) {
      // TRƯỜNG HỢP 1: Chỉ thêm câu hỏi đã có sẵn vào Quiz (Giữ nguyên)
      const isAlreadyAdded = quiz.questions.some(
        (id) => id.toString() === existingId.toString(),
      );
      if (!isAlreadyAdded) {
        quiz.questions.push(existingId);
        await quiz.save();
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json(quiz);
    } else {
      // TRƯỜNG HỢP 2: TẠO MỚI CÂU HỎI THẲNG TRONG QUIZ
      if (!req.body.text) {
        const err = new Error("Dữ liệu rỗng, không thể tạo câu hỏi mới!");
        err.status = 400;
        return next(err);
      }

      //  SỬA TẠI ĐÂY: Phải gán author cho câu hỏi mới tạo trong Quiz!
      req.body.author = req.user._id; 

      const question = await Question.create(req.body);
      quiz.questions.push(question._id);
      await quiz.save();
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json(quiz);
    }
  } catch (err) {
      next(err); // Đẩy lỗi ra Express, không dùng console.error nữa
  }
};

// 2. HÀM XỬ LÝ SỐ NHIỀU: POST /quizzes/:quizId/questions
exports.addManyQuestions = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json("Quiz not found");
    }

    // Dữ liệu gửi lên từ UI có thể là mảng ID trực tiếp: ['id1', 'id2']
    // Hoặc mảng chứa Object: [{_id: 'id1'}, {_id: 'id2'}]
    const incomingData = req.body;
    if (!incomingData || !Array.isArray(incomingData)) {
      return res
        .status(400)
        .json("Dữ liệu gửi lên phải là một mảng ID câu hỏi");
    }

    // Chuyển đổi mọi định dạng về mảng chuỗi ID sạch
    const questionIdsToPush = incomingData.map((item) => {
      if (typeof item === "object" && item._id) return item._id.toString();
      if (typeof item === "object" && item.questionId)
        return item.questionId.toString();
      return item.toString();
    });

    // Lọc bỏ những ID câu hỏi đã tồn tại sẵn trong Quiz để tránh bị trùng lặp
    const currentQuizQuestions = quiz.questions.map((id) => id.toString());
    const uniqueNewIds = questionIdsToPush.filter(
      (id) => !currentQuizQuestions.includes(id),
    );

    if (uniqueNewIds.length > 0) {
      quiz.questions.push(...uniqueNewIds);
      await quiz.save();
    }

    res.json(quiz);
  } catch (err) {
    console.error("Lỗi addManyQuestions:", err.message);
    res.status(500).json("Lỗi server nội bộ");
  }
};
exports.deleteQuestionInQuiz = async (req, res) => {
  const { quizId, questionId } = req.params;

  // xóa question
  await Question.findByIdAndDelete(questionId);

  // xóa id khỏi quiz.questions
  await Quiz.findByIdAndUpdate(
    quizId,
    {
      $pull: {
        questions: questionId,
      },
    },
    { new: true },
  );

  res.json("Question removed from quiz",
  );
};

