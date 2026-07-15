// frontend/src/services/room.service.ts
import { RoomAPI } from '@/lib/bindings'
import type { Room, RoomType } from '@/types'

export interface CreateRoomTypeRequest { name: string; default_rate: number }
export interface CreateRoomRequest {
  room_number: string; type_id: string;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
}
export interface UpdateRoomRequest extends CreateRoomRequest {}

export const roomService = {
  // Room Types
  getAllRoomTypes: () => RoomAPI.GetAllRoomTypes() as unknown as Promise<RoomType[]>,
  createRoomType: (d: CreateRoomTypeRequest) =>
    RoomAPI.CreateRoomType({ name: d.name, default_rate: d.default_rate }) as unknown as Promise<RoomType>,
  updateRoomType: (id: string, d: CreateRoomTypeRequest) =>
    RoomAPI.UpdateRoomType(id, { name: d.name, default_rate: d.default_rate }) as unknown as Promise<RoomType>,
  // Rooms
  getAllRooms: () => RoomAPI.GetAllRooms() as unknown as Promise<Room[]>,
  createRoom: (d: CreateRoomRequest) =>
    RoomAPI.CreateRoom({ room_number: d.room_number, type_id: d.type_id, status: d.status ?? 'AVAILABLE' }) as unknown as Promise<Room>,
  updateRoom: (id: string, d: UpdateRoomRequest) =>
    RoomAPI.UpdateRoom(id, { room_number: d.room_number, type_id: d.type_id, status: d.status ?? 'AVAILABLE' }) as unknown as Promise<Room>,
}
