import { useState, useEffect } from 'react'
import { Plus, Building2, Layers, Edit2, BedDouble } from 'lucide-react'
import RoomForm from '../../components/rooms/RoomForm'
import RoomTypeForm from '../../components/rooms/RoomTypeForm'
import { roomService } from '@/services'
import { StatCard, StatusBadge, EmptyState, TableSkeleton, PageHeader, Button, SectionCard } from '@/components/common'
import type { Room, RoomType } from '../../types'
import { handleApiError } from '@/lib/bindings'

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
    if (!open) setSelectedRoom(undefined)
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
    if (!open) setSelectedRoomType(undefined)
  }

  const statCards = [
    { label: 'Total Rooms', value: roomStats.total, icon: Building2, accent: 'primary' as const },
    { label: 'Available', value: roomStats.available, icon: BedDouble, accent: 'green' as const },
    { label: 'Occupied', value: roomStats.occupied, icon: Building2, accent: 'blue' as const },
    { label: 'Maintenance', value: roomStats.maintenance, icon: Layers, accent: 'amber' as const },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rooms"
        subtitle="Manage your lodge rooms and types"
        action={
          <div className="flex gap-3">
            <Button variant="secondary" icon={Plus} onClick={() => setIsRoomTypeFormOpen(true)}>Add Type</Button>
            <Button icon={Plus} onClick={() => setIsRoomFormOpen(true)}>Add Room</Button>
          </div>
        }
      />

      <RoomTypeForm open={isRoomTypeFormOpen} onOpenChange={handleRoomTypeFormClose} onSubmit={handleRoomTypeSubmit} roomType={selectedRoomType} />
      <RoomForm open={isRoomFormOpen} onOpenChange={handleRoomFormClose} onSubmit={handleRoomSubmit} roomTypes={roomTypes} room={selectedRoom} />

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : (
        <>
          {/* Stats */}
          <div className="stagger-children grid gap-4 md:grid-cols-4">
            {statCards.map((stat, idx) => (
              <StatCard key={stat.label} index={idx} label={stat.label} value={stat.value} icon={stat.icon} accent={stat.accent} />
            ))}
          </div>

          {/* Room Types — card grid */}
          <SectionCard title="Room Types" icon={Layers}>
            {roomTypes.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {roomTypes.map((type) => {
                  const count = rooms.filter(r => r.type_id === type.id).length
                  return (
                    <div key={type.id} className="card card-hover flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: 'hsl(var(--primary)/0.10)' }}>
                          <BedDouble className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} />
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">{type.name}</p>
                          <p className="text-sm tabular-nums" style={{ color: 'hsl(var(--status-green))' }}>
                            ₹{type.default_rate.toFixed(2)}<span className="text-gray-400">/night</span>
                          </p>
                          <span className="mt-2 inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs text-gray-600">{count} rooms</span>
                        </div>
                      </div>
                      <button onClick={() => handleEditRoomType(type)} aria-label={`Edit ${type.name}`}
                        className="rounded-lg bg-muted p-2 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900">
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState icon={Layers} title="No room types yet" hint="Add a room type to start organizing your rooms." />
            )}
          </SectionCard>

          {/* All Rooms — table */}
          <SectionCard title="All Rooms" icon={Building2}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="col-label px-4 py-3 text-left">Room Number</th>
                    <th className="col-label px-4 py-3 text-left">Type</th>
                    <th className="col-label px-4 py-3 text-left">Rate</th>
                    <th className="col-label px-4 py-3 text-left">Status</th>
                    <th className="col-label px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.length > 0 ? (
                    rooms.map((room, idx) => (
                      <tr key={room.id} className="group border-b border-gray-50" style={{ background: idx % 2 ? 'hsl(36 20% 98%)' : undefined }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white" style={{ background: 'hsl(var(--primary))' }}>
                              {room.room_number}
                            </span>
                            <span className="font-semibold text-gray-900">Room {room.room_number}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{room.type?.name || 'N/A'}</td>
                        <td className="px-4 py-3 tabular-nums">
                          <span className="font-semibold" style={{ color: 'hsl(var(--status-green))' }}>₹{room.type?.default_rate.toFixed(2) || '0.00'}</span>
                          <span className="text-gray-400">/night</span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={room.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                            <button onClick={() => handleEditRoom(room)} aria-label={`Edit room ${room.room_number}`}
                              className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
                              <Edit2 className="h-4 w-4" /> Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5}><EmptyState icon={Building2} title="No rooms yet" hint="Add room types and rooms to get started." /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  )
}
