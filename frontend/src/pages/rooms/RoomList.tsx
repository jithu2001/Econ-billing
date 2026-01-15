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
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      border: 'border-green-500/30',
      icon: <DoorOpen className="w-3.5 h-3.5" />,
      dot: 'bg-green-400'
    },
    OCCUPIED: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      icon: <Building2 className="w-3.5 h-3.5" />,
      dot: 'bg-blue-400'
    },
    MAINTENANCE: {
      bg: 'bg-amber-500/20',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      icon: <Wrench className="w-3.5 h-3.5" />,
      dot: 'bg-amber-400'
    },
  }

  const style = styles[status]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${status === 'AVAILABLE' ? 'animate-pulse' : ''}`} />
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
    { label: 'Total Rooms', value: roomStats.total, color: 'purple' },
    { label: 'Available', value: roomStats.available, color: 'green' },
    { label: 'Occupied', value: roomStats.occupied, color: 'blue' },
    { label: 'Maintenance', value: roomStats.maintenance, color: 'amber' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between slide-in-left">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold gradient-text">Rooms</h1>
          </div>
          <p className="text-slate-400">Manage your lodge rooms and types</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsRoomTypeFormOpen(true)}
            className="px-5 py-2.5 bg-slate-800 border border-purple-500/30 rounded-xl font-semibold text-purple-400 hover:bg-slate-700 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Type
          </button>
          <button
            onClick={() => setIsRoomFormOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 relative overflow-hidden group"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />
            <Plus className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Add Room</span>
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
            className="glass-card fade-in group"
            style={{ animationDelay: `${idx * 0.1}s`, opacity: 0 }}
          >
            <p className="text-sm font-medium text-slate-400 mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${
              stat.color === 'purple' ? 'text-white' :
              stat.color === 'green' ? 'text-green-400' :
              stat.color === 'blue' ? 'text-blue-400' : 'text-amber-400'
            }`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Room Types */}
      <div className="glass-card fade-in" style={{ animationDelay: '0.4s', opacity: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Layers className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Room Types</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Type Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Default Rate</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Rooms Count</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {roomTypes.length > 0 ? (
                roomTypes.map((type) => {
                  const typeRoomsCount = rooms.filter(r => r.type_id === type.id).length
                  return (
                    <tr key={type.id} className="group hover:bg-slate-800/30 transition-all">
                      <td className="px-6 py-4 font-medium text-white">{type.name}</td>
                      <td className="px-6 py-4 text-slate-300">
                        <span className="text-green-400 font-semibold">₹{type.default_rate.toFixed(2)}</span>
                        <span className="text-slate-500">/night</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-300">
                          {typeRoomsCount} rooms
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEditRoomType(type)}
                          className="px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-sm font-medium text-purple-400 hover:bg-slate-700 hover:border-purple-500/50 transition-all flex items-center gap-2"
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
                    <Layers className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                    <p className="text-slate-500">No room types found. Add one to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rooms List */}
      <div className="glass-card fade-in" style={{ animationDelay: '0.5s', opacity: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">All Rooms</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Room Number</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Rate</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <tr key={room.id} className="group hover:bg-slate-800/30 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {room.room_number}
                        </div>
                        <span className="font-semibold text-white">Room {room.room_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{room.type?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="text-green-400 font-semibold">₹{room.type?.default_rate.toFixed(2) || '0.00'}</span>
                      <span className="text-slate-500">/night</span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(room.status)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEditRoom(room)}
                        className="px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-sm font-medium text-purple-400 hover:bg-slate-700 hover:border-purple-500/50 transition-all flex items-center gap-2"
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
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                    <p className="text-slate-500">No rooms found. Add room types and rooms to get started.</p>
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
