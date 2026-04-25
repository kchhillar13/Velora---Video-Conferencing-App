import { Socket } from 'socket.io';
import { RoomManager } from '../room-manager';
import {
  JoinRoomPayload,
  LeaveRoomPayload,
  PeerInfo,
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '../../types/socket.types';
import { logger } from '../../utils/logger';
import { meetingService } from '../../services/meeting.service';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

/**
 * Connection Handler
 * Manages room join/leave and disconnection events.
 *
 * IMPORTANT: All user-joined / user-left broadcasts are handled by the
 * SocketRoomObserver (registered in socket-server.ts). Handlers here
 * should NOT manually emit user-joined / user-left to avoid double-emission.
 */
export function registerConnectionHandlers(
  socket: TypedSocket,
  roomManager: RoomManager
): void {
  /**
   * join-room: Client wants to join a meeting room.
   * 1. Guard against duplicate joins (idempotent)
   * 2. Add the peer to the room
   * 3. Join the Socket.io room for targeted broadcasting
   * 4. Send current room state to the new participant
   * 5. Observer pattern handles notifying existing participants
   */
  socket.on('join-room', async (data: JoinRoomPayload) => {
    try {
      const { meetingCode, userId, userName } = data;

      if (!meetingCode || !userId || !userName) {
        socket.emit('error', { message: 'Missing required fields: meetingCode, userId, userName' });
        return;
      }

      // Idempotent guard: if this socket is already in the room, just re-send room state
      if (roomManager.isInRoom(meetingCode, socket.id)) {
        logger.debug(`[join-room] Socket ${socket.id} already in room ${meetingCode}, re-sending state`);
        const participants = roomManager.getRoomParticipants(meetingCode)
          .filter((p) => p.socketId !== socket.id);
        socket.emit('room-users', participants);
        return;
      }

      // Store user data on the socket for disconnect handling
      socket.data.userId = userId;
      socket.data.userName = userName;
      socket.data.currentRoom = meetingCode;

      const peer: PeerInfo = {
        socketId: socket.id,
        userId,
        userName,
        audioEnabled: true,
        videoEnabled: true,
        isScreenSharing: false,
      };

      // Get existing participants BEFORE joining (to send to the new peer)
      const existingParticipants = roomManager.getRoomParticipants(meetingCode);

      // Join the Socket.io room FIRST (so the Observer can broadcast to this room)
      socket.join(meetingCode);

      // Add the peer to the room — this fires the Observer which broadcasts user-joined
      roomManager.joinRoom(meetingCode, peer);

      // Send existing room participants to the new peer (excluding themselves)
      socket.emit('room-users', existingParticipants);

      // Track participant in the database (fire and forget)
      meetingService.addParticipant(meetingCode, userId).catch((err) => {
        logger.debug('Could not track participant in DB (may not exist yet):', err);
      });

      logger.info(`[join-room] ${userName} joined ${meetingCode} (${existingParticipants.length + 1} peers)`);
    } catch (error) {
      logger.error('Error handling join-room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  /**
   * leave-room: Client wants to leave a meeting room.
   */
  socket.on('leave-room', (data: LeaveRoomPayload) => {
    try {
      const { meetingCode } = data;
      handleLeaveRoom(socket, roomManager, meetingCode);
    } catch (error) {
      logger.error('Error handling leave-room:', error);
    }
  });

  /**
   * disconnect: Socket disconnected (browser close, network issue, etc.)
   * The Observer pattern handles broadcasting user-left via SocketRoomObserver.
   */
  socket.on('disconnect', (reason) => {
    try {
      logger.info(`[disconnect] Socket ${socket.id} disconnected: ${reason}`);
      const result = roomManager.removeFromAllRooms(socket.id);

      if (result) {
        // Observer already broadcast user-left to the room.
        // We only need to handle DB tracking here.
        if (result.peer.userId) {
          meetingService.markParticipantLeft(result.meetingCode, result.peer.userId).catch(() => {
            // Silent fail — non-critical
          });
        }
      }
    } catch (error) {
      logger.error('Error handling disconnect:', error);
    }
  });
}

/**
 * Handles a peer leaving a room cleanly.
 * The Observer pattern handles broadcasting user-left.
 *
 * IMPORTANT: We leave the Socket.io room FIRST so the Observer's
 * broadcast doesn't send user-left back to the leaving socket itself.
 */
function handleLeaveRoom(
  socket: TypedSocket,
  roomManager: RoomManager,
  meetingCode: string
): void {
  // Leave the Socket.io room FIRST so we don't receive our own user-left
  socket.leave(meetingCode);
  socket.data.currentRoom = null;

  // leaveRoom fires the Observer which broadcasts user-left to remaining peers
  const peer = roomManager.leaveRoom(meetingCode, socket.id);

  if (peer) {
    logger.info(`[leave-room] ${peer.userName} left ${meetingCode}`);

    // Track in DB
    meetingService.markParticipantLeft(meetingCode, peer.userId).catch(() => {
      // Silent fail
    });
  }
}
