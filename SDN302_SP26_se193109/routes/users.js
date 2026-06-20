const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../middleware/authenticate');

/* ==========================================
   1. API ĐĂNG KÝ (SIGNUP)
   ========================================== */
router.post('/signup', async (req, res, next) => {
    try {
        const isAdmin = req.body.admin === 1 || req.body.admin === '1' || req.body.admin === true || req.body.admin === 'true';
        const newUser = new User({ 
            username: req.body.username,
            admin: isAdmin
        });

        const user = await User.register(newUser, req.body.password);

        // Đăng ký thành công, phản hồi về cho client
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, status: 'Registration Successful!' });
    } catch (err) {
        // Nếu trùng username hoặc có lỗi hệ thống, trả về mã lỗi 500 kèm chi tiết lỗi
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
    }
});

/* ==========================================
   2. API ĐĂNG NHẬP (LOGIN)
   ========================================== */
router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
    // Sau khi authenticate thành công, Passport nạp user hợp lệ vào req.user
    // Chúng ta ký (sign) một JWT token chứa ID người dùng để gửi lại cho Client
    const token = authenticate.getToken({ _id: req.user._id });
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ 
        success: true, 
        token: token, 
        user: {
            _id: req.user._id,
            username: req.user.username,
            admin: req.user.admin
        },
        status: 'You are successfully logged in!' 
    });
});

/* ==========================================
   2.5. API LẤY THÔNG TIN USER HIỆN TẠI (ME)
   ========================================== */
router.get('/me', authenticate.verifyUser, (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
        success: true,
        user: {
            _id: req.user._id,
            username: req.user.username,
            admin: req.user.admin
        }
    });
});

/* ==========================================
   3. TASK 3: LẤY TOÀN BỘ DANH SÁCH USER (CHỈ ADMIN)
   ========================================== */
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.find({})
        .then((users) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(users);
        })
        .catch((err) => next(err));
});

/* ==========================================
   4. CẬP NHẬT QUYỀN ADMIN CỦA USER (CHỈ ADMIN)
   ========================================== */
router.patch('/:userId/admin', authenticate.verifyUser, authenticate.verifyAdmin, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { admin } = req.body;

        // Prevent self-demotion
        if (req.user._id.toString() === userId.toString()) {
            return res.status(400).json({ message: 'Bạn không thể tự thay đổi quyền Admin của chính mình!' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { admin: !!admin } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            admin: updatedUser.admin
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;