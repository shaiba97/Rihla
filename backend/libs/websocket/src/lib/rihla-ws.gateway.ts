import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WS_EVENTS } from './ws-events.constants';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:4200',
      'http://localhost:4100',
      'http://localhost:4000',
    ],
    credentials: true,
  },
  namespace: '/',
})
export class RihlaWsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RihlaWsGateway.name);

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(WS_EVENTS.JOIN_ROOM)
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
  }

  @SubscribeMessage(WS_EVENTS.LEAVE_ROOM)
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room);
    this.logger.log(`Client ${client.id} left room: ${room}`);
  }

  @SubscribeMessage(WS_EVENTS.WATCH_SEATS)
  handleWatchSeats(client: Socket, tripId: string) {
    const room = `trip:${tripId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} watching seats for trip: ${tripId}`);
  }

  @SubscribeMessage(WS_EVENTS.UNWATCH_SEATS)
  handleUnwatchSeats(client: Socket, tripId: string) {
    const room = `trip:${tripId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} stopped watching seats for trip: ${tripId}`);
  }

  emitToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }

  emitToAdmin(event: string, data: any) {
    this.server.to('admin').emit(event, data);
  }

  emitToCompany(companyId: string, event: string, data: any) {
    this.server.to(`company:${companyId}`).emit(event, data);
  }

  emitToCustomer(customerId: string, event: string, data: any) {
    this.server.to(`customer:${customerId}`).emit(event, data);
  }

  emitPublic(event: string, data: any) {
    this.server.emit(event, data);
  }

  emitSeatUpdate(tripId: string, data: {
    seatNumbers: number[];
    action: 'booked' | 'held' | 'released';
    bookingId?: string;
  }) {
    this.server.to(`trip:${tripId}`).emit(WS_EVENTS.SEAT_UPDATED, { tripId, ...data });
  }
}
