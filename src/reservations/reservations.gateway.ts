import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ReservationsService } from './reservations.service';
import { Inject, forwardRef } from '@nestjs/common';

@WebSocketGateway({ namespace: 'api/v1/reservations' })
export class ReservationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(forwardRef(() => ReservationsService))
    private readonly reservationsService: ReservationsService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection() {
    this.getReservations();
  }

  handleDisconnect() {}

  @SubscribeMessage('reservations')
  async getReservations() {
    const reservations = await this.reservationsService.getReservations();
    this.server.emit('reservations', reservations);
  }
}
