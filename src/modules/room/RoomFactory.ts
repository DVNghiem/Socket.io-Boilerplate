import { Room } from './Room';

export class RoomFactory {
  private static rooms: Map<string, Room> = new Map();

  public static getRoom(roomId: string): Room {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Room(roomId));
    }
    return this.rooms.get(roomId)!;
  }
}