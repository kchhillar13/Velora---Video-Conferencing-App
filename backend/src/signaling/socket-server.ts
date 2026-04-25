import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  PeerInfo,
} from '../types/socket.types';
import { RoomManager, RoomObserver } from './room-manager';
import { registerConnectionHandlers } from './handlers/connection.handler';
import { registerWebRTCHandlers } from './handlers/webrtc.handler';
import { registerMediaHandlers } from './handlers/media.handler';
import { logger } from '../utils/logger';

// ─── Socket Room Observer ─────────────────────────────

/**
 * SocketRoomObserver — Observer Pattern (Concrete Observer)
 * Listens to RoomManager events and broadcasts them to
 * Socket.io rooms. This centralizes all broadcast logic
 * and prevents double-emission from handlers.
 */
class SocketRoomObserver implements RoomObserver {
  constructor(
    private io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
  ) {}

  onUserJoined(meetingCode: string, peer: PeerInfo): void {
    // Broadcast to everyone in the room EXCEPT the new peer
    this.io.to(meetingCode).except(peer.socketId).emit('user-joined', peer);
    logger.debug(`[observer] Broadcasted user-joined: ${peer.userName} → room ${meetingCode}`);
  }

  onUserLeft(meetingCode: string, peer: PeerInfo): void {
    // Broadcast to everyone remaining in the room
    this.io.to(meetingCode).emit('user-left', {
      userId: peer.userId,
      socketId: peer.socketId,
    });
    logger.debug(`[observer] Broadcasted user-left: ${peer.userName} → room ${meetingCode}`);
  }

  onRoomClosed(meetingCode: string): void {
    logger.info(`[observer] Room closed: ${meetingCode}`);
  }
}

// ─── Socket Server (Singleton) ────────────────────────

/**
 * SocketServer — Singleton
 * Initializes Socket.io, registers event handlers, and manages
 * the signaling lifecycle for WebRTC peer connections.
 */
export class SocketServer {
  private static instance: SocketServer | null = null;
  private io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  private roomManager: RoomManager;

  private constructor(httpServer: HttpServer, corsOrigin: string) {
    this.io = new Server(httpServer, {
      cors: {
        origin: [corsOrigin],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingInterval: 25000,
      pingTimeout: 20000,
    });

    this.roomManager = new RoomManager();

    // Register the Observer that handles all Socket.io broadcasts
    const observer = new SocketRoomObserver(this.io);
    this.roomManager.subscribe(observer);

    this.setupEventHandlers();
  }

  public static initialize(httpServer: HttpServer, corsOrigin: string): SocketServer {
    if (!SocketServer.instance) {
      SocketServer.instance = new SocketServer(httpServer, corsOrigin);
      logger.info('✅ Socket.io signaling server initialized (Singleton)');
    }
    return SocketServer.instance;
  }

  public static getInstance(): SocketServer {
    if (!SocketServer.instance) {
      throw new Error('SocketServer not initialized. Call initialize() first.');
    }
    return SocketServer.instance;
  }

  public getIO(): Server {
    return this.io;
  }

  public getRoomManager(): RoomManager {
    return this.roomManager;
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(`[connection] New socket connected: ${socket.id}`);

      // Register all handler modules
      registerConnectionHandlers(socket, this.roomManager);
      registerWebRTCHandlers(socket);
      registerMediaHandlers(socket, this.roomManager);
    });

    // Log server-level events
    this.io.engine.on('connection_error', (err) => {
      logger.error('Socket.io connection error:', {
        code: err.code,
        message: err.message,
      });
    });
  }

  public async close(): Promise<void> {
    return new Promise((resolve) => {
      this.io.close(() => {
        SocketServer.instance = null;
        logger.info('Socket.io server closed');
        resolve();
      });
    });
  }

  /**
   * Returns stats about active rooms and connections.
   */
  public getStats(): {
    connectedSockets: number;
    activeRooms: number;
    rooms: Array<{ meetingCode: string; participantCount: number }>;
  } {
    return {
      connectedSockets: this.io.engine.clientsCount,
      activeRooms: this.roomManager.getActiveRoomCount(),
      rooms: this.roomManager.getSnapshot(),
    };
  }
}
