import { prisma } from '../config/database';
import { logger } from '../utils/logger';

interface SyncUserInput {
  clerkId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

/**
 * UserService
 * Handles all user-related business logic.
 * Uses Prisma singleton for database operations.
 */
export class UserService {
  /**
   * Creates or updates a user record from Clerk data.
   * Called when a user signs in/signs up via Clerk.
   */
  async syncUser(data: SyncUserInput) {
    const user = await prisma.user.upsert({
      where: { clerkId: data.clerkId },
      update: {
        email: data.email,
        name: data.name,
        avatarUrl: data.avatarUrl ?? null,
      },
      create: {
        clerkId: data.clerkId,
        email: data.email,
        name: data.name,
        avatarUrl: data.avatarUrl ?? null,
      },
    });

    logger.info(`User synced: ${user.email} (${user.clerkId})`);
    return user;
  }

  /**
   * Retrieves a user by their Clerk ID.
   */
  async getUserByClerkId(clerkId: string) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new Error(`User not found for clerkId: ${clerkId}`);
    }

    return user;
  }

  /**
   * Retrieves a user by their internal ID.
   */
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error(`User not found: ${id}`);
    }

    return user;
  }
}

export const userService = new UserService();
