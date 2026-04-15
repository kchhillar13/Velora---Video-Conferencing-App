import { MeetingType } from '../types/meeting.types';
import { generateMeetingCode } from '../utils/id-generator';

// ─── Meeting Configuration ─────────────────────────────

interface MeetingSettings {
  allowScreenShare: boolean;
  allowRecording: boolean;
  waitingRoom: boolean;
  autoMuteOnJoin: boolean;
  maxParticipants: number;
}

interface MeetingConfig {
  title: string;
  meetingCode: string;
  type: MeetingType;
  scheduledAt: Date | null;
  settings: MeetingSettings;
}

interface CreateMeetingInput {
  title: string;
  type: MeetingType;
  scheduledAt?: string;
  hostName?: string;
}

// ─── Factory Pattern ───────────────────────────────────

/**
 * MeetingFactory
 * Creates different meeting configurations based on meeting type.
 * Each type has different defaults for settings and behavior.
 */
export class MeetingFactory {
  public static createMeeting(input: CreateMeetingInput): MeetingConfig {
    switch (input.type) {
      case MeetingType.INSTANT:
        return MeetingFactory.createInstantMeeting(input);
      case MeetingType.SCHEDULED:
        return MeetingFactory.createScheduledMeeting(input);
      case MeetingType.PERSONAL:
        return MeetingFactory.createPersonalRoom(input);
      default:
        return MeetingFactory.createInstantMeeting(input);
    }
  }

  private static createInstantMeeting(input: CreateMeetingInput): MeetingConfig {
    return {
      title: input.title || 'Instant Meeting',
      meetingCode: generateMeetingCode(),
      type: MeetingType.INSTANT,
      scheduledAt: null,
      settings: {
        allowScreenShare: true,
        allowRecording: true,
        waitingRoom: false,
        autoMuteOnJoin: false,
        maxParticipants: 12,
      },
    };
  }

  private static createScheduledMeeting(input: CreateMeetingInput): MeetingConfig {
    if (!input.scheduledAt) {
      throw new Error('Scheduled meetings require a scheduledAt date');
    }

    return {
      title: input.title || 'Scheduled Meeting',
      meetingCode: generateMeetingCode(),
      type: MeetingType.SCHEDULED,
      scheduledAt: new Date(input.scheduledAt),
      settings: {
        allowScreenShare: true,
        allowRecording: true,
        waitingRoom: true,
        autoMuteOnJoin: true,
        maxParticipants: 12,
      },
    };
  }

  private static createPersonalRoom(input: CreateMeetingInput): MeetingConfig {
    return {
      title: input.title || `${input.hostName ?? 'User'}'s Personal Room`,
      meetingCode: generateMeetingCode(),
      type: MeetingType.PERSONAL,
      scheduledAt: null,
      settings: {
        allowScreenShare: true,
        allowRecording: true,
        waitingRoom: false,
        autoMuteOnJoin: false,
        maxParticipants: 20,
      },
    };
  }
}
