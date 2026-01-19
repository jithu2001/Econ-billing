import { useState, useEffect } from 'react'
import { Plus, Building2, DoorOpen, Wrench, Layers, Edit2 } from 'lucide-react'
import RoomForm from '../../components/rooms/RoomForm'
import RoomTypeForm from '../../components/rooms/RoomTypeForm'
import { roomService } from '@/services'
import type { Room, RoomType } from '../../types'
import { handleApiError } from '@/lib/api'

const getStatusBadge = (status: Room['status']) => {
  const styles = {
    AVAILABLE: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      icon: <DoorOpen className="w-3.5 h-3.5" />,
      dot: 'bg-green-500'
    },
    OCCUPIED: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      icon: <Building2 className="w-3.5 h-3.5" />,
      dot: 'bg-blue-500'
    },
    MAINTENANCE: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-200',
      icon: <Wrench className="w-3.5 h-3.5" />,
      dot: 'bg-amber-500'
    },
  }

  const style = styles[status]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  )
}

export default function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false)
  const [isRoomTypeFormOpen, setIsRoomTypeFormOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>(undefined)
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | undefined>(undefined)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [roomsData, roomTypesData] = await Promise.all([
        roomService.getAllRooms(),
        roomService.getAllRoomTypes(),
      ])
      setRooms(roomsData)
      setRoomTypes(roomTypesData)
    } catch (error) {
      console.error('Failed to load rooms:', handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const roomStats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'AVAILABLE').length,
    occupied: rooms.filter(r => r.status === 'OCCUPIED').length,
    maintenance: rooms.filter(r => r.status === 'MAINTENANCE').length,
  }

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room)
    setIsRoomFormOpen(true)
  }

  const handleRoomSubmit = async (roomData: any) => {
    try {
      if (selectedRoom) {
        await roomService.updateRoom(selectedRoom.id, roomData)
      } else {
        await roomService.createRoom(roomData)
      }
      await loadData()
      setSelectedRoom(undefined)
      setIsRoomFormOpen(false)
    } catch (error) {
      console.error('Failed to save room:', handleApiError(error))
      throw error
    }
  }

  const handleRoomFormClose = (open: boolean) => {
    setIsRoomFormOpen(open)
    if (!open) {
      setSelectedRoom(undefined)
    }
  }

  const handleEditRoomType = (roomType: RoomType) => {
    setSelectedRoomType(roomType)
    setIsRoomTypeFormOpen(true)
  }

  const handleRoomTypeSubmit = async (roomTypeData: any) => {
    try {
      if (selectedRoomType) {
        await roomService.updateRoomType(selectedRoomType.id, roomTypeData)
      } else {
        await roomService.createRoomType(roomTypeData)
      }
      await loadData()
      setSelectedRoomType(undefined)
      setIsRoomTypeFormOpen(false)
    } catch (error) {
      console.error('Failed to save room type:', handleApiError(error))
      throw error
    }
  }

  const handleRoomTypeFormClose = (open: boolean) => {
    setIsRoomTypeFormOpen(open)
    if (!open) {
      setSelectedRoomType(undefined)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Rooms', value: roomStats.total, color: 'gray' },
    { label: 'Available', value: roomStats.available, color: 'green' },
    { label: 'Occupied', value: roomStats.occupied, color: 'blue' },
    { label: 'Maintenance', value: roomStats.maintenance, color: 'amber' },
  ]

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between slide-in-left">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">Rooms</h1>
          </div>
          <p className="text-gray-500">Manage your lodge rooms and types</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsRoomTypeFormOpen(true)}
            className="px-5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-200 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Type
          </button>
          <button
            onClick={() => setIsRoomFormOpen(true)}
            className="px-5 py-2.5 bg-gray-900 rounded-xl font-semibold text-white hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Room</span>
          </button>
        </div>
      </div>

      <RoomTypeForm
        open={isRoomTypeFormOpen}
        onOpenChange={handleRoomTypeFormClose}
        onSubmit={handleRoomTypeSubmit}
        roomType={selectedRoomType}
      />

      <RoomForm
        open={isRoomFormOpen}
        onOpenChange={handleRoomFormClose}
        onSubmit={handleRoomSubmit}
        roomTypes={roomTypes}
        room={selectedRoom}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((stat, idx) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-xl p-6 fade-in"
            style={{ animationDelay: `${idx * 0.1}s`, opacity: 0 }}
          >
            <p className="text-sm font-medium text-gray-500 mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${
              stat.color === 'gray' ? 'text-gray-900' :
              stat.color === 'green' ? 'text-green-600' :
              stat.color === 'blue' ? 'text-blue-600' : 'text-amber-600'
            }`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Room Types */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 fade-in" style={{ animationDelay: '0.4s', opacity: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Layers className="w-5 h-5 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Room Types</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Default Rate</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rooms Count</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {roomTypes.length > 0 ? (
                roomTypes.map((type) => {
                  const typeRoomsCount = rooms.filter(r => r.type_id === type.id).length
                  return (
                    <tr key={type.id} className="hover:bg-gray-50 transition-all">
                      <td className="px-6 py-4 font-medium text-gray-900">{type.name}</td>
                      <td className="px-6 py-4 text-gray-600">
                        <span className="text-green-600 font-semibold">₹{type.default_rate.toFixed(2)}</span>
                        <span className="text-gray-400">/night</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-600">
                          {typeRoomsCount} rooms
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEditRoomType(type)}
                          className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-all flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No room types found. Add one to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rooms List */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 fade-in" style={{ animationDelay: '0.5s', opacity: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Building2 className="w-5 h-5 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">All Rooms</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Room Number</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white font-bold">
                          {room.room_number}
                        </div>
                        <span className="font-semibold text-gray-900">Room {room.room_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{room.type?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="text-green-600 font-semibold">₹{room.type?.default_rate.toFixed(2) || '0.00'}</span>
                      <span className="text-gray-400">/night</span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(room.status)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEditRoom(room)}
                        className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-all flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No rooms found. Add room types and rooms to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
