import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../middleware/jwt';

const prisma = new PrismaClient();

export const register = async (email: string, password: string, name: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  return generateToken(user.id);
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) {
    throw new Error('Invalid email or password');
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  return generateToken(user.id);
};