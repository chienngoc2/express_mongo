require('dotenv').config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors"); 

const connectDB = require("./config/db");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const questionRoutes = require("./routes/questionRoutes");
const quizRoutes = require("./routes/quizRoutes");

var app = express();

// 1. CONNECT MONGODB
connectDB();

// 2. CONFIG CORS (Phải nằm trước các Routes)
// Cho phép Ass2 kết nối tới, cũng như các URL từ Vercel
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL // Thêm biến môi trường cho Vercel frontend URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || origin.includes("vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

// 3. VIEW ENGINE
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 4. MIDDLEWARES (Xử lý request)
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 5. ROUTES (Chuyển hướng request)
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/questions", questionRoutes);
app.use("/quizzes", quizRoutes);

// 6. 404 HANDLER (Bắt các request không khớp với Route nào ở trên)
app.use(function (req, res, next) {
  next(createError(404));
});

// 7. ERROR HANDLER (Bắt buộc phải nằm ở đáy file)
app.use(function (err, req, res, next) {
  const status = err.status || 500;
  res.status(status);

  // Nếu là request gọi API, trả về phản hồi dưới dạng JSON
  if (req.originalUrl.startsWith('/questions') || 
      req.originalUrl.startsWith('/quizzes') || 
      req.originalUrl.startsWith('/users')) {
    return res.json({
      error: {
        name: err.name || "Error",
        message: err.message,
        status: status
      }
    });
  }

  // Đối với các request web thông thường, render giao diện lỗi (HTML)
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.render("error");
});

module.exports = app;
