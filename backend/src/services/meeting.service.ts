import { MeetingStatus, MeetingType } from '../types/meeting.types';
import { prisma } from '../config/database';
import { MeetingFactory } from '../patterns/factory';
import { logger } from '../utils/logger';

interface CreateMeetingInput {
  title: string;
  type: MeetingType;
  scheduledAt?: string;
}

type MeetingFilter = 'upcoming' | 'previous' | 'all';

/**
 * MeetingService
 * Handles all meeting-related business logic.
 * Uses Factory pattern for meeting creation.
 */
export class MeetingService {
  /**
   * Creates a new meeting using the Factory pattern.
   */
  async createMeeting(userId: string, input: CreateMeetingInput) {
    // Get the user to include their name for personal rooms
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      throw new Error('User not found. Please sync your account first.');
    }

    // Use Factory to generate meeting config based on type
    const config = MeetingFactory.createMeeting({
      title: input.title,
      type: input.type,
      scheduledAt: input.scheduledAt,
      hostName: user.name,
    });

    const meeting = await prisma.meeting.create({
      data: {
        meetingCode: config.meetingCode,
        title: config.title,
        hostId: user.id,
        type: config.type,
        status: MeetingStatus.PENDING,
        scheduledAt: config.scheduledAt,
      },
      include: {
        host: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    logger.info(`Meeting created: ${meeting.meetingCode} (${meeting.type}) by ${user.name}`);
    return meeting;
  }

  /**
   * Retrieves a meeting by its unique meeting code.
   */
  async getMeetingByCode(code: string) {
    const meeting = await prisma.meeting.findUnique({
      where: { meetingCode: code },
      include: {
        host: {
          select: { id: true, name: true, avatarUrl: true },
        },
        _count: {
          select: { participants: true },
        },
      },
    });

    if (!meeting) {
      throw new Error(`Meeting not found: ${code}`);
    }

    return meeting;
  }

  /**
   * Lists meetings for a user with filtering.
   */
  async getUserMeetings(clerkId: string, filter: MeetingFilter) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const baseWhere = {
      OR: [
        { hostId: user.id },
        { participants: { some: { userId: user.id } } },
      ],
    };

    let dateFilter = {};
    let orderBy: Record<string, string> = { createdAt: 'desc' };

    switch (filter) {
      case 'upcoming':
        dateFilter = {
          status: { in: [MeetingStatus.PENDING, MeetingStatus.ACTIVE] },
          OR: [
            { scheduledAt: { gte: now } },
            { scheduledAt: null, status: MeetingStatus.PENDING },
          ],
        };
        orderBy = { scheduledAt: 'asc' };
        break;
      case 'previous':
        dateFilter = {
          status: MeetingStatus.ENDED,
        };
        orderBy = { endedAt: 'desc' };
        break;
      case 'all':
      default:
        break;
    }

    const meetings = await prisma.meeting.findMany({
      where: { ...baseWhere, ...dateFilter },
      include: {
        host: {
          select: { id: true, name: true, avatarUrl: true },
        },
        _count: {
          select: { participants: true },
        },
      },
      orderBy,
      take: 50,
    });

    return meetings;
  }

  /**
   * Updates a meeting's status (e.g., PENDING → ACTIVE → ENDED).
   */
  async updateMeetingStatus(meetingId: string, clerkId: string, status: MeetingStatus) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      throw new Error('User not found');
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      throw new Error('Meeting not found');
    }

    if (meeting.hostId !== user.id) {
      throw new Error('Only the host can update meeting status');
    }

    const updateData: Record<string, unknown> = { status };

    if (status === MeetingStatus.ACTIVE) {
      updateData.startedAt = new Date();
    } else if (status === MeetingStatus.ENDED) {
      updateData.endedAt = new Date();
    }

    const updated = await prisma.meeting.update({
      where: { id: meetingId },
      data: updateData,
      include: {
        host: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    logger.info(`Meeting ${meeting.meetingCode} status updated to ${status}`);
    return updated;
  }

  /**
   * Adds a participant to a meeting.
   */
  async addParticipant(meetingCode: string, clerkId: string, role: 'HOST' | 'PARTICIPANT' = 'PARTICIPANT') {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      throw new Error('User not found');
    }

    const meeting = await prisma.meeting.findUnique({ where: { meetingCode } });
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    const participant = await prisma.participant.upsert({
      where: {
        meetingId_userId: {
          meetingId: meeting.id,
          userId: user.id,
        },
      },
      update: {
        leftAt: null, // Re-joining resets leftAt
        joinedAt: new Date(),
      },
      create: {
        meetingId: meeting.id,
        userId: user.id,
        role,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    return participant;
  }

  /**
   * Marks a participant as having left a meeting.
   */
  async markParticipantLeft(meetingCode: string, clerkId: string) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return;

    const meeting = await prisma.meeting.findUnique({ where: { meetingCode } });
    if (!meeting) return;

    await prisma.participant.updateMany({
      where: {
        meetingId: meeting.id,
        userId: user.id,
        leftAt: null,
      },
      data: {
        leftAt: new Date(),
      },
    });
  }

  /**
   * Gets recordings for a meeting.
   */
  async getMeetingRecordings(meetingId: string) {
    return prisma.recording.findMany({
      where: { meetingId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Deletes a meeting from the database.
   * Only the host can delete a meeting.
   * Participants and Recordings are cascade-deleted by Prisma schema rules.
   */
  async deleteMeeting(meetingId: string, clerkId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      throw new Error('User not found');
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      throw new Error('Meeting not found');
    }

    if (meeting.hostId !== user.id) {
      throw new Error('Only the host can delete a meeting');
    }

    // Cascade: Participant + Recording rows are deleted automatically (onDelete: Cascade)
    await prisma.meeting.delete({ where: { id: meetingId } });
    logger.info(`Meeting ${meeting.meetingCode} deleted by ${user.name}`);
  }
}

export const meetingService = new MeetingService();
