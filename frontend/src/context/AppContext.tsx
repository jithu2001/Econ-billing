import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Customer, Room, RoomType, Reservation, Bill, Payment } from '../types'

// Initial mock data
const initialCustomers: Customer[] = [
  {
    id: '1',
    full_name: 'John Doe',
    phone: '+91 9876543210',
    address: '123 Main St, Mumbai',
    id_proof_type: 'Aadhar',
    id_proof_number: '1234-5678-9012',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    full_name: 'Jane Smith',
    phone: '+91 9876543211',
    address: '456 Park Ave, Delhi',
    id_proof_type: 'Passport',
    id_proof_number: 'A1234567',
    created_at: '2024-01-16T11:00:00Z',
    updated_at: '2024-01-16T11:00:00Z',
  },
]

const initialRoomTypes: RoomType[] = [
  { id: 'rt1', name: 'Standard', default_rate: 1000, created_at: '', updated_at: '' },
  { id: 'rt2', name: 'Deluxe', default_rate: 1500, created_at: '', updated_at: '' },
  { id: 'rt3', name: 'Suite', default_rate: 2500, created_at: '', updated_at: '' },
]

const initialRooms: Room[] = [
  { id: 'r1', room_number: '101', type_id: 'rt1', status: 'AVAILABLE', created_at: '', updated_at: '', type: initialRoomTypes[0] },
  { id: 'r2', room_number: '102', type_id: 'rt1', status: 'OCCUPIED', created_at: '', updated_at: '', type: initialRoomTypes[0] },
  { id: 'r3', room_number: '201', type_id: 'rt2', status: 'AVAILABLE', created_at: '', updated_at: '', type: initialRoomTypes[1] },
  { id: 'r4', room_number: '202', type_id: 'rt2', status: 'MAINTENANCE', created_at: '', updated_at: '', type: initialRoomTypes[1] },
  { id: 'r5', room_number: '301', type_id: 'rt3', status: 'AVAILABLE', created_at: '', updated_at: '', type: initialRoomTypes[2] },
]

const initialReservations: Reservation[] = [
  {
    id: 'res1',
    customer_id: '1',
    room_id: 'r2',
    check_in_date: '2024-01-20',
    expected_check_out_date: '2024-01-25',
    status: 'ACTIVE',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    customer: initialCustomers[0],
    room: initialRooms[1],
  },
]

const initialBills: Bill[] = []
const initialPayments: Payment[] = []

interface AppContextType {
  customers: Customer[]
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Customer
  rooms: Room[]
  addRoom: (room: Omit<Room, 'id' | 'created_at' | 'updated_at' | 'type'>) => Room
  updateRoom: (roomId: string, roomData: Omit<Room, 'id' | 'created_at' | 'updated_at' | 'type'>) => void
  roomTypes: RoomType[]
  addRoomType: (roomType: Omit<RoomType, 'id' | 'created_at' | 'updated_at'>) => RoomType
  updateRoomType: (roomTypeId: string, roomTypeData: Omit<RoomType, 'id' | 'created_at' | 'updated_at'>) => void
  reservations: Reservation[]
  addReservation: (reservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at' | 'customer' | 'room'>) => Reservation
  bills: Bill[]
  addBill: (bill: Omit<Bill, 'id' | 'created_at' | 'updated_at'>) => Bill
  updateBillStatus: (billId: string, status: Bill['status']) => void
  payments: Payment[]
  addPayment: (payment: Omit<Payment, 'id'>) => Payment
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(initialRoomTypes)
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations)
  const [bills, setBills] = useState<Bill[]>(initialBills)
  const [payments, setPayments] = useState<Payment[]>(initialPayments)

  const addCustomer = (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: String(customers.length + 1),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setCustomers([...customers, newCustomer])
    return newCustomer
  }

  const addRoomType = (roomTypeData: Omit<RoomType, 'id' | 'created_at' | 'updated_at'>) => {
    const newRoomType: RoomType = {
      ...roomTypeData,
      id: `rt${roomTypes.length + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setRoomTypes([...roomTypes, newRoomType])
    return newRoomType
  }

  const updateRoomType = (roomTypeId: string, roomTypeData: Omit<RoomType, 'id' | 'created_at' | 'updated_at'>) => {
    setRoomTypes(roomTypes.map(rt =>
      rt.id === roomTypeId
        ? { ...rt, ...roomTypeData, updated_at: new Date().toISOString() }
        : rt
    ))
    // Also update the type reference in rooms
    setRooms(rooms.map(r =>
      r.type_id === roomTypeId
        ? { ...r, type: { ...r.type!, ...roomTypeData, updated_at: new Date().toISOString() } }
        : r
    ))
  }

  const addRoom = (roomData: Omit<Room, 'id' | 'created_at' | 'updated_at' | 'type'>) => {
    const roomType = roomTypes.find(rt => rt.id === roomData.type_id)
    const newRoom: Room = {
      ...roomData,
      id: `r${rooms.length + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      type: roomType,
    }
    setRooms([...rooms, newRoom])
    return newRoom
  }

  const updateRoom = (roomId: string, roomData: Omit<Room, 'id' | 'created_at' | 'updated_at' | 'type'>) => {
    const roomType = roomTypes.find(rt => rt.id === roomData.type_id)
    setRooms(rooms.map(r =>
      r.id === roomId
        ? { ...r, ...roomData, updated_at: new Date().toISOString(), type: roomType }
        : r
    ))
  }

  const addReservation = (reservationData: Omit<Reservation, 'id' | 'created_at' | 'updated_at' | 'customer' | 'room'>) => {
    const customer = customers.find(c => c.id === reservationData.customer_id)
    const room = rooms.find(r => r.id === reservationData.room_id)

    const newReservation: Reservation = {
      ...reservationData,
      id: `res${reservations.length + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      customer,
      room,
    }

    setReservations([...reservations, newReservation])

    // Update room status to OCCUPIED
    if (room) {
      setRooms(rooms.map(r =>
        r.id === room.id ? { ...r, status: 'OCCUPIED' as const } : r
      ))
    }

    return newReservation
  }

  const addBill = (billData: Omit<Bill, 'id' | 'created_at' | 'updated_at'>) => {
    const newBill: Bill = {
      ...billData,
      id: `bill${bills.length + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setBills([...bills, newBill])
    return newBill
  }

  const updateBillStatus = (billId: string, status: Bill['status']) => {
    setBills(bills.map(bill =>
      bill.id === billId ? { ...bill, status, updated_at: new Date().toISOString() } : bill
    ))
  }

  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: `payment${payments.length + 1}`,
    }
    setPayments([...payments, newPayment])

    // Update bill status to PAID if payment equals or exceeds bill amount
    const bill = bills.find(b => b.id === paymentData.bill_id)
    if (bill && newPayment.amount >= bill.total_amount) {
      updateBillStatus(bill.id, 'PAID')
    }

    return newPayment
  }

  return (
    <AppContext.Provider
      value={{
        customers,
        addCustomer,
        rooms,
        addRoom,
        updateRoom,
        roomTypes,
        addRoomType,
        updateRoomType,
        reservations,
        addReservation,
        bills,
        addBill,
        updateBillStatus,
        payments,
        addPayment,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
