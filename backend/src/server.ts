import dotenv from "dotenv";
import app from "./app";
import sequelize from "./config/db";

dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // DB bağlantısı
    await sequelize.authenticate();
    console.log("✅ MySQL bağlantısı başarılı");

    // DB sync
    await sequelize.sync({ alter: true }); 
    console.log("✅ Tablolar senkronize edildi");

    // Server
    app.listen(PORT, () => {
      console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
      console.log(`📑 Swagger: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("❌ Veritabanı bağlantı hatası:", error);
  }
}

startServer();
