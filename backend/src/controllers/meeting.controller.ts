import { Request, Response } from 'express';
import { MeetingStatus, MeetingType } from '../types/meeting.types';
import { meetingService } from '../services/meeting.service';
import { logger } from '../utils/logger';

/**
 * MeetingController
 * Handles HTTP requests for meeting operations.
 */
export class MeetingController {
  /**
   * POST /api/meetings
   * Creates a new meeting.
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.auth) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { title, type, scheduledAt } = req.body as {
        title: string;
        type: MeetingType;
        scheduledAt?: string;
      };

      const meeting = await meetingService.createMeeting(req.auth.clerkId, {
        title: title || 'Untitled Meeting',
        type: type || MeetingType.INSTANT,
        scheduledAt,
      });

      res.status(201).json(meeting);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create meeting';
      logger.error('Failed to create meeting:', error);
      res.status(400).json({ error: message });
    }
  }

  /**
   * GET /api/meetings/:code
   * Retrieves a meeting by its meeting code.
   */
  async getByCode(req: Request, res: Response): Promise<void> {
    try {
      if (!req.auth) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const code = req.params.code as string;

      if (!code) {
        res.status(400).json({ error: 'Meeting code is required' });
        return;
      }

      const meeting = await meetingService.getMeetingByCode(code);
      res.status(200).json(meeting);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Meeting not found';
      logger.error('Failed to get meeting:', error);
      res.status(404).json({ error: message });
    }
  }

  /**
   * GET /api/meetings
   * Lists meetings for the authenticated user.
   * Query: ?filter=upcoming|previous|all
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      if (!req.auth) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const filter = (req.query.filter as string) || 'all';
      const validFilters = ['upcoming', 'previous', 'all'];

      if (!validFilters.includes(filter)) {
        res.status(400).json({ error: `Invalid filter. Must be one of: ${validFilters.join(', ')}` });
        return;
      }

      const meetings = await meetingService.getUserMeetings(
        req.auth.clerkId,
        filter as 'upcoming' | 'previous' | 'all'
      );

      res.status(200).json(meetings);
    } catch (error) {
      logger.error('Failed to list meetings:', error);
      res.status(500).json({ error: 'Failed to list meetings' });
    }
  }

  /**
   * PATCH /api/meetings/:id/status
   * Updates a meeting's status (only by host).
   */
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.auth) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const id = req.params.id as string;
      const { status } = req.body as { status: MeetingStatus };

      if (!status || !Object.values(MeetingStatus).includes(status)) {
        res.status(400).json({
          error: `Invalid status. Must be one of: ${Object.values(MeetingStatus).join(', ')}`,
        });
        return;
      }

      const meeting = await meetingService.updateMeetingStatus(id, req.auth.clerkId, status);
      res.status(200).json(meeting);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update meeting status';
      logger.error('Failed to update meeting status:', error);
      res.status(400).json({ error: message });
    }
  }

  /**
   * GET /api/meetings/:id/recordings
   * Gets recordings for a specific meeting.
   */
  async getRecordings(req: Request, res: Response): Promise<void> {
    try {
      if (!req.auth) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const id = req.params.id as string;
      const recordings = await meetingService.getMeetingRecordings(id);
      res.status(200).json(recordings);
    } catch (error) {
      logger.error('Failed to get recordings:', error);
      res.status(500).json({ error: 'Failed to get recordings' });
    }
  }

  /**
   * DELETE /api/meetings/:id
   * Permanently deletes a meeting. Only the host may do this.
   * Related Participants and Recordings are cascade-deleted by the DB.
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      if (!req.auth) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const id = req.params.id as string;
      if (!id) {
        res.status(400).json({ error: 'Meeting ID is required' });
        return;
      }

      await meetingService.deleteMeeting(id, req.auth.clerkId);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete meeting';
      logger.error('Failed to delete meeting:', error);
      const statusCode =
        message === 'Meeting not found' ? 404
        : message === 'Only the host can delete a meeting' ? 403
        : 400;
      res.status(statusCode).json({ error: message });
    }
  }
}

export const meetingController = new MeetingController();
