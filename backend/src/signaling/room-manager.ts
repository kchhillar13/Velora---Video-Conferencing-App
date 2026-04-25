import { PeerInfo, RoomState } from '../types/socket.types';
import { logger } from '../utils/logger';

// ─── Observer Interface ─────────────────────────────────

export interface RoomObserver {
  onUserJoined(meetingCode: string, peer: PeerInfo): void;
  onUserLeft(meetingCode: string, peer: PeerInfo): void;
  onRoomClosed(meetingCode: string): void;
}

// ─── Room Manager (Observable) ──────────────────────────

/**
 * RoomManager — Observer Pattern
 * Manages meeting room state and notifies observers of changes.
 * Tracks participants in each room using an in-memory Map.
 */
export class RoomManager {
  private rooms: Map<string, RoomState> = new Map();
  private observers: Set<RoomObserver> = new Set();

  public subscribe(observer: RoomObserver): void {
    this.observers.add(observer);
  }

  public unsubscribe(observer: RoomObserver): void {
    this.observers.delete(observer);
  }

  private notifyUserJoined(meetingCode: string, peer: PeerInfo): void {
    for (const observer of this.observers) {
      observer.onUserJoined(meetingCode, peer);
    }
  }

  private notifyUserLeft(meetingCode: string, peer: PeerInfo): void {
    for (const observer of this.observers) {
      observer.onUserLeft(meetingCode, peer);
    }
  }

  private notifyRoomClosed(meetingCode: string): void {
    for (const observer of this.observers) {
      observer.onRoomClosed(meetingCode);
    }
  }

  /**
   * Creates a new room or returns existing one.
   */
  public getOrCreateRoom(meetingCode: string): RoomState {
    let room = this.rooms.get(meetingCode);
    if (!room) {
      room = {
        meetingCode,
        participants: new Map(),
        createdAt: new Date(),
        isActive: true,
      };
      this.rooms.set(meetingCode, room);
      logger.info(`Room created: ${meetingCode}`);
    }
    return room;
  }

  /**
   * Checks if a socket is already in a room.
   */
  public isInRoom(meetingCode: string, socketId: string): boolean {
    const room = this.rooms.get(meetingCode);
    return room?.participants.has(socketId) ?? false;
  }

  /**
   * Adds a participant to a room.
   * Returns the full list of participants AFTER joining.
   */
  public joinRoom(meetingCode: string, peer: PeerInfo): PeerInfo[] {
    const room = this.getOrCreateRoom(meetingCode);
    room.participants.set(peer.socketId, peer);

    logger.info(`User ${peer.userName} (${peer.socketId}) joined room ${meetingCode}`);
    this.notifyUserJoined(meetingCode, peer);

    return this.getRoomParticipants(meetingCode);
  }

  /**
   * Removes a participant from a room by socket ID.
   * Fires observer notification so the SocketRoomObserver broadcasts user-left.
   * Returns the removed peer info, or null if not found.
   */
  public leaveRoom(meetingCode: string, socketId: string): PeerInfo | null {
    const room = this.rooms.get(meetingCode);
    if (!room) return null;

    const peer = room.participants.get(socketId);
    if (!peer) return null;

    room.participants.delete(socketId);
    logger.info(`User ${peer.userName} (${socketId}) left room ${meetingCode}`);
    this.notifyUserLeft(meetingCode, peer);

    // Clean up empty rooms
    if (room.participants.size === 0) {
      this.rooms.delete(meetingCode);
      this.notifyRoomClosed(meetingCode);
      logger.info(`Room ${meetingCode} closed (empty)`);
    }

    return peer;
  }

  /**
   * Removes a participant without firing observer notifications.
   * Used internally when the caller handles broadcasts directly.
   */
  public leaveRoomSilent(meetingCode: string, socketId: string): PeerInfo | null {
    const room = this.rooms.get(meetingCode);
    if (!room) return null;

    const peer = room.participants.get(socketId);
    if (!peer) return null;

    room.participants.delete(socketId);
    logger.info(`User ${peer.userName} (${socketId}) silently removed from room ${meetingCode}`);

    // Clean up empty rooms
    if (room.participants.size === 0) {
      this.rooms.delete(meetingCode);
      logger.info(`Room ${meetingCode} closed (empty)`);
    }

    return peer;
  }

  /**
   * Removes a socket from all rooms (used on disconnect).
   * Uses the normal leaveRoom with observer notification so the
   * SocketRoomObserver handles broadcasting user-left.
   */
  public removeFromAllRooms(socketId: string): { meetingCode: string; peer: PeerInfo } | null {
    for (const [meetingCode, room] of this.rooms) {
      const peer = room.participants.get(socketId);
      if (peer) {
        // Use the notifying version — the Observer will broadcast user-left
        this.leaveRoom(meetingCode, socketId);
        return { meetingCode, peer };
      }
    }
    return null;
  }

  /**
   * Returns all participants in a room.
   */
  public getRoomParticipants(meetingCode: string): PeerInfo[] {
    const room = this.rooms.get(meetingCode);
    if (!room) return [];
    return Array.from(room.participants.values());
  }

  /**
   * Gets peer info by socket ID within a specific room.
   */
  public getPeerBySocketId(meetingCode: string, socketId: string): PeerInfo | undefined {
    const room = this.rooms.get(meetingCode);
    return room?.participants.get(socketId);
  }

  /**
   * Updates peer media state.
   */
  public updatePeerState(
    meetingCode: string,
    socketId: string,
    updates: Partial<Pick<PeerInfo, 'audioEnabled' | 'videoEnabled' | 'isScreenSharing'>>
  ): PeerInfo | null {
    const room = this.rooms.get(meetingCode);
    if (!room) return null;

    const peer = room.participants.get(socketId);
    if (!peer) return null;

    Object.assign(peer, updates);
    return peer;
  }

  /**
   * Returns the number of active rooms.
   */
  public getActiveRoomCount(): number {
    return this.rooms.size;
  }

  /**
   * Returns a snapshot of all rooms for debugging.
   */
  public getSnapshot(): Array<{ meetingCode: string; participantCount: number }> {
    return Array.from(this.rooms.entries()).map(([code, room]) => ({
      meetingCode: code,
      participantCount: room.participants.size,
    }));
  }
}
