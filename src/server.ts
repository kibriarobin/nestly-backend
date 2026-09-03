import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";
import { seedAdmin } from "./utils/seed";

const PORT = config.port;

async function main() {
  try {
    await prisma.$connect();
    console.log("Nestly database Connected successfully!");

    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`Nestly server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error starting the server:", err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
