const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();

// ✅ 1. Хэрэглэгчийн сагс авах
const getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({error: "Хэрэглэгч нэвтрээгүй байна!"});
    }

    const cart = await prisma.cart.findFirst({
      where: {userId},
      include: {
        cartItems: {
          include: {product: true},
        },
      },
    });

    if (!cart) {
      return res.status(404).json({error: "Сагс олдсонгүй!"});
    }

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Сагс татахад алдаа гарлаа!"});
  }
};

// ✅ 2. Бүтээгдэхүүн сагсанд нэмэх
const addToCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity) || 1;

    if (!userId) {
      return res.status(401).json({error: "Хэрэглэгч нэвтрээгүй байна!"});
    }
    if (!productId) {
      return res.status(400).json({error: "Бүтээгдэхүүн ID байхгүй байна!"});
    }

    const product = await prisma.product.findUnique({where: {id: productId}});
    if (!product) {
      return res.status(404).json({error: "Бүтээгдэхүүн олдсонгүй!"});
    }

    let cart = await prisma.cart.findFirst({
      where: {userId},
      include: {cartItems: true},
    });

    if (!cart) {
      cart = await prisma.cart.create({data: {userId}});
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {cartId: cart.id, productId},
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: {id: existingItem.id},
        data: {quantity: existingItem.quantity + quantity},
      });
    } else {
      await prisma.cartItem.create({
        data: {cartId: cart.id, productId, quantity},
      });
    }

    res.json({message: "Бүтээгдэхүүн сагсанд амжилттай нэмэгдлээ!"});
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Сагсанд бүтээгдэхүүн нэмэхэд алдаа гарлаа!"});
  }
};

// ✅ 3. Сагснаас бүтээгдэхүүн хасах
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const productId = Number(req.body.productId);

    if (!userId) {
      return res.status(401).json({error: "Хэрэглэгч нэвтрээгүй байна!"});
    }
    if (!productId) {
      return res.status(400).json({error: "Бүтээгдэхүүн ID байхгүй байна!"});
    }

    const cart = await prisma.cart.findFirst({
      where: {userId},
      include: {cartItems: true},
    });

    if (!cart) {
      return res.status(404).json({error: "Сагс олдсонгүй."});
    }

    const existingItem = cart.cartItems.find(
      (item) => item.productId === productId
    );
    if (!existingItem) {
      return res.status(404).json({error: "Бүтээгдэхүүн сагсанд алга байна."});
    }

    if (existingItem.quantity > 1) {
      await prisma.cartItem.update({
        where: {id: existingItem.id},
        data: {quantity: existingItem.quantity - 1},
      });
    } else {
      await prisma.cartItem.delete({where: {id: existingItem.id}});
    }

    res.json({message: "Бүтээгдэхүүн сагснаас хасагдлаа!"});
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({error: "Сагснаас бүтээгдэхүүн хасахад алдаа гарлаа!"});
  }
};

// ✅ 4. Сагсыг хоослох
const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({error: "Хэрэглэгч нэвтрээгүй байна!"});
    }

    const cart = await prisma.cart.findFirst({where: {userId}});

    if (!cart) {
      return res.status(404).json({error: "Сагс олдсонгүй."});
    }

    await prisma.cartItem.deleteMany({where: {cartId: cart.id}});

    res.json({message: "Сагс амжилттай хоослогдлоо!"});
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Сагс хоослоход алдаа гарлаа!"});
  }
};

module.exports = {getCart, addToCart, removeFromCart, clearCart};
