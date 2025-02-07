const jwt = require("jsonwebtoken");
const {PrismaClient} = require("@prisma/client");

const prisma = new PrismaClient();

const checkAuth = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({error: "Токен байхгүй эсвэл буруу форматтай!"});
  }

  const token = authHeader.split(" ")[1]; // "Bearer TOKEN" -> TOKEN хэсгийг авна

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({where: {id: decoded.userId}}); // ✅ `userId` ашиглах!

    if (!user) {
      return res.status(404).json({error: "Хэрэглэгч олдсонгүй!"});
    }

    req.user = user; // Middleware-аар дамжиж байгаа учир `req.user`-д хадгална
    next();
  } catch (error) {
    console.error("Token шалгах үед алдаа гарлаа:", error);
    res.status(401).json({error: "Буруу токен!"});
  }
};

module.exports = {checkAuth};
