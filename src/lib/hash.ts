import { hash, compare } from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    const hashedPassword = await hash(password, saltRounds);
    return hashedPassword;
};

export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    const isMatch = await compare(password, hashedPassword);
    return isMatch;
}
