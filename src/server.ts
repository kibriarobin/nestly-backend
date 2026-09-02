import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";

const PORT = config.port;

async function main() {
  try {
    // await prisma.$connect();
    // console.log("Nestly database Connected successfully!");
    app.listen(PORT, () => {
      console.log(`Nestly server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error starting the server:", err);
    // await prisma.$disconnect();
    process.exit(1);
  }
}

main();
