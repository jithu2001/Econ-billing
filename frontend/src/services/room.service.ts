import { apiClient } from '@/lib/api';
import type { Room, RoomType } from '@/types';

export interface CreateRoomTypeRequest {
  name: string;
  default_rate: number;
}

export interface CreateRoomRequest {
  room_number: string;
  type_id: string;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
}

export interface UpdateRoomRequest {
  room_number?: string;
  type_id?: string;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
}

export const roomService = {
  // Room Types
  async getAllRoomTypes(): Promise<RoomType[]> {
    const response = await apiClient.get<RoomType[]>('/api/room-types');
    return response.data;
  },

  async createRoomType(data: CreateRoomTypeRequest): Promise<RoomType> {
    const response = await apiClient.post<RoomType>('/api/room-types', data);
    return response.data;
  },

  async updateRoomType(id: string, data: CreateRoomTypeRequest): Promise<RoomType> {
    const response = await apiClient.put<RoomType>(`/api/room-types/${id}`, data);
    return response.data;
  },

  // Rooms
  async getAllRooms(): Promise<Room[]> {
    const response = await apiClient.get<Room[]>('/api/rooms');
    return response.data;
  },

  async createRoom(data: CreateRoomRequest): Promise<Room> {
    const response = await apiClient.post<Room>('/api/rooms', data);
    return response.data;
  },

  async updateRoom(id: string, data: UpdateRoomRequest): Promise<Room> {
    const response = await apiClient.put<Room>(`/api/rooms/${id}`, data);
    return response.data;
  },
};
