import bcrypt from "bcrypt";
import { UserRole } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";

export const seedAdmin = async () => {
  try {
    const isAdminExists = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN },
    });

    if (isAdminExists) {
      console.log("Admin already exists");
      return;
    }

    const name = config.admin_name;
    const email = config.admin_email;
    const password = config.admin_password;

    if (!name || !email || !password) {
      throw new Error("Admin credentials are not provided in the .env file");
    }

    const hashPassword = await bcrypt.hash(
      password,
      Number(config.bcrypt_salt_rounds),
    );

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
        role: UserRole.ADMIN,
      },
    });

    console.log("Admin created successfully:", admin.email);
  } catch (error) {
    console.error("Error creating admin:", error);
  }
};
