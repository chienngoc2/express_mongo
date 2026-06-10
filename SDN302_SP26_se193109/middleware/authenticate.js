const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Questions = require('../models/questionModel');
const Quiz = require('../models/quizModel');

// Cấu hình Secret Key cho JWT (Được cấu hình trong file .env)
const config = {
    secretKey: process.env.SECRET_KEY
};

// 1. Cấu hình Passport Local (Xác thực bằng Username/Password khi Login)
exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 2. Hàm hỗ trợ tạo Token sau khi User đăng nhập thành công
exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, { expiresIn: 3600 }); // Token có hạn 1 tiếng
};

// 3. Cấu hình Chiến lược JWT (Cách trích xuất và xác thực token gửi lên từ Client)
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // Lấy token từ Header 'Authorization: Bearer <TOKEN>'
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    // Tìm User dựa trên ID lưu trong payload của Token
    User.findOne({ _id: jwt_payload._id })
        .then((user) => {
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch((err) => done(err, false));
}));

// ==========================================
// MIDDLEWARES KIỂM TRA QUYỀN (AUTHORIZATION)
// ==========================================

/**
 * Middleware: Xác thực User thông thường qua JWT
 * Nếu thành công, Express tự động nạp object user vào `req.user`
 */
exports.verifyUser = passport.authenticate('jwt', { session: false });

/**
 * Task 1: Middleware kiểm tra quyền ADMIN
 * Phải đặt ĐẰNG SAU verifyUser trong route
 */
exports.verifyAdmin = (req, res, next) => {
    // Kiểm tra xem req.user có tồn tại và thuộc tính admin có bằng true không
    if (req.user && req.user.admin) {
        return next(); // Hợp lệ, cho phép đi tiếp đến endpoint tiếp theo
    } else {
        // Nếu không phải Admin, chặn lại và trả về lỗi 403
        const err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
};

/**
 * Middleware: Kiểm tra quyền TÁC GIẢ câu hỏi - KHÔNG có admin bypass
 * Chỉ đúng tác giả (author) mới được sửa/xóa câu hỏi của mình.
 */
exports.verifyAuthor = (req, res, next) => {
    const questionId = req.params.questionId;

    Questions.findById(questionId)
        .then((question) => {
            if (!question) {
                const err = new Error('Question not found!');
                err.status = 404;
                return next(err);
            }

            // Cho phép tác giả hoặc Admin thực hiện thay đổi
            if (req.user.admin || (question.author && question.author.equals(req.user._id))) {
                return next();
            } else {
                const err = new Error('Bạn không có quyền chỉnh sửa câu hỏi của người khác!');
                err.status = 403;
                return next(err);
            }
        })
        .catch((err) => next(err));
};

/**
 * Middleware: Kiểm tra quyền CHỦ SỞ HỮU bài quiz - KHÔNG có admin bypass
 * Chỉ người tạo quiz mới được sửa/xóa quiz của mình.
 */
exports.verifyQuizOwner = (req, res, next) => {
    const quizId = req.params.quizId;

    Quiz.findById(quizId)
        .then((quiz) => {
            if (!quiz) {
                const err = new Error('Quiz not found!');
                err.status = 404;
                return next(err);
            }

            // Cho phép chủ sở hữu hoặc Admin thực hiện thay đổi
            if (req.user.admin || (quiz.author && quiz.author.equals(req.user._id))) {
                return next();
            } else {
                const err = new Error('Bạn không có quyền chỉnh sửa bộ đề của người khác!');
                err.status = 403;
                return next(err);
            }
        })
        .catch((err) => next(err));
};