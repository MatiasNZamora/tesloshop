import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Socket, Server } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces';

@WebSocketGateway({ cors:true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService:JwtService,
  ) {}
  
  async handleConnection( client: Socket ) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify( token );
      await this.messagesWsService.registerClient( client, payload.id );
    } catch (error) {
      client.disconnect();
      return;
    }
    this.wss.emit( 'Clients-updated', this.messagesWsService.getConnectedClients() )
  };

  handleDisconnect( client: Socket ) {
    // console.log( 'Cliente Desconectado...', client.id );
    this.messagesWsService.removeClient( client.id );

    this.wss.emit( 'Clients-updated', this.messagesWsService.getConnectedClients() )
  };

  @SubscribeMessage('message-from-client')
  handleMessageFromClient( client: Socket, payload: NewMessageDto ){
    
    //? emitir unicamente al cliente
    // message-from-server
    // client.emit('message-from-server', {
    //   fullName: 'soy yo',
    //   message: payload.message || 'no-message'
    // });

    //? emitir a todos menos al cliente inicial
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'soy yo',
    //   message: payload.message || 'no-message'
    // });

    //? emitir para todos invluyendo al cliente
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName( client.id ),
      message: payload.message || 'no-message'
    });

  };

};
