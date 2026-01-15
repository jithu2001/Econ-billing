import { useState, useEffect } from 'react'
import { Plus, Building2, DoorOpen, Wrench } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import RoomForm from '../../components/rooms/RoomForm'
import RoomTypeForm from '../../components/rooms/RoomTypeForm'
import { roomService } from '@/services'
import type { Room, RoomType } from '../../types'
import { handleApiError } from '@/lib/api'

const getStatusIcon = (status: Room['status']) => {
  switch (status) {
    case 'AVAILABLE':
      return <DoorOpen className="h-4 w-4 text-green-600" />
    case 'OCCUPIED':
      return <Building2 className="h-4 w-4 text-blue-600" />
    case 'MAINTENANCE':
      return <Wrench className="h-4 w-4 text-orange-600" />
  }
}

const getStatusBadge = (status: Room['status']) => {
  const colors = {
    AVAILABLE: 'bg-green-100 text-green-800',
    OCCUPIED: 'bg-blue-100 text-blue-800',
    MAINTENANCE: 'bg-orange-100 text-orange-800',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status]}`}>
      {getStatusIcon(status)}
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
        <div className="text-lg text-muted-foreground">Loading rooms...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
          <p className="text-muted-foreground">Manage your lodge rooms and types</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsRoomTypeFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Room Type
          </Button>
          <Button onClick={() => setIsRoomFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Button>
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roomStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{roomStats.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{roomStats.occupied}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{roomStats.maintenance}</div>
          </CardContent>
        </Card>
      </div>

      {/* Room Types */}
      <Card>
        <CardHeader>
          <CardTitle>Room Types</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type Name</TableHead>
                <TableHead>Default Rate</TableHead>
                <TableHead>Rooms Count</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roomTypes.length > 0 ? (
                roomTypes.map((type) => {
                  const typeRoomsCount = rooms.filter(r => r.type_id === type.id).length
                  return (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell>₹{type.default_rate.toFixed(2)}/night</TableCell>
                      <TableCell>{typeRoomsCount} rooms</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleEditRoomType(type)}>Edit</Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No room types found. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Rooms List */}
      <Card>
        <CardHeader>
          <CardTitle>All Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Default Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium text-lg">{room.room_number}</TableCell>
                    <TableCell>{room.type?.name || 'N/A'}</TableCell>
                    <TableCell>₹{room.type?.default_rate.toFixed(2) || '0.00'}/night</TableCell>
                    <TableCell>{getStatusBadge(room.status)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleEditRoom(room)}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No rooms found. Add room types and rooms to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
