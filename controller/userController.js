const {PrismaClient} = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

// ✅ 1. Хэрэглэгч бүртгэх
exports.createUser = async (req, res) => {
  const {email, password, name, phone} = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
      },
    });

    res.status(201).json({
      message: "Хэрэглэгч амжилттай бүртгэгдлээ!",
      user,
    });
  } catch (err) {
    console.error("Хэрэглэгч бүртгэхэд алдаа гарлаа:", err.message);
    res.status(500).json({error: "Хэрэглэгч үүсгэхэд алдаа гарлаа!"});
  }
};

// ✅ 2. Нэвтрэх (Login)
exports.loginUser = async (req, res) => {
  const {email, password} = req.body;

  try {
    // Хэрэглэгчийн мэдээллийг шалгах
    const user = await prisma.user.findUnique({
      where: {email},
    });

    if (!user) {
      console.log("Хэрэглэгч олдсонгүй:", email);
      return res.status(401).json({error: "Хэрэглэгч олдсонгүй!"});
    }

    // Нууц үгийг шалгах
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Нууц үг буруу:", email);
      return res.status(401).json({error: "Нууц үг буруу!"});
    }

    // ✅ JWT токен үүсгэх
    const token = jwt.sign(
      {userId: user.id, email: user.email}, // `userId` гэж хадгалах
      process.env.JWT_SECRET,
      {expiresIn: "1h"}
    );

    res.status(200).json({
      message: "Амжилттай нэвтэрлээ!",
      token,
    });
  } catch (err) {
    console.error("Логинд алдаа гарлаа:", err.message);
    res.status(500).json({error: "Нэвтрэхэд алдаа гарлаа!"});
  }
};
