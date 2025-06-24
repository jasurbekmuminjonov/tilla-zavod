const mongoose = require("mongoose");
exports.connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Mongodbga muvaffaqiyatli ulandi✅");
  } catch (e) {
    console.error(`Mongodbga ulanishda xatolik: ${e.message}`);
    process.exit(1);
  }
};
