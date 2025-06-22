import bcrypt from "bcryptjs";

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;

  const hash = await bcrypt.hash(password, saltRounds);

  return hash;
};

const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export default {
  hashPassword,
  comparePassword,
};
