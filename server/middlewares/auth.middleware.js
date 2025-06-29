const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const publicPaths = ["/user/login", "/factory/create"];

  if (publicPaths.includes(req.path)) {
    return next();
  }
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token topilmadi" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token noto'g'ri yoki muddati tugagan" });
  }
};

module.exports = authMiddleware;
