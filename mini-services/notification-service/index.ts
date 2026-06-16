import { createServer } from 'http'
import { Server, Socket } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ─── Types ───────────────────────────────────────────────────────────────────

interface OnlineUser {
  id: string
  socketId: string
  username: string
  role: 'customer' | 'seller' | 'admin'
  joinedAt: Date
}

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  receiverId: string
  receiverName: string
  content: string
  timestamp: Date
  roomId: string
}

interface Notification {
  id: string
  type: 'order' | 'promotion' | 'system' | 'chat' | 'inventory'
  title: string
  message: string
  userId?: string
  data?: Record<string, unknown>
  timestamp: Date
  read: boolean
}

interface OrderUpdate {
  orderId: string
  userId: string
  status: string
  message: string
  timestamp: Date
  estimatedDelivery?: string
}

interface StockUpdate {
  productId: string
  productName: string
  remainingStock: number
  totalStock: number
  flashSaleId?: string
  timestamp: Date
}

// ─── In-Memory State ─────────────────────────────────────────────────────────

const onlineUsers = new Map<string, OnlineUser>()
const typingUsers = new Map<string, { roomId: string; timeout: NodeJS.Timeout }>()

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateId = (): string => Math.random().toString(36).substring(2, 11) + Date.now().toString(36)

const getChatRoomId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('-chat-')
}

const getOnlineUserList = (): Omit<OnlineUser, 'socketId'>[] =>
  Array.from(onlineUsers.values()).map(({ socketId, ...rest }) => rest)

// ─── Demo Data ───────────────────────────────────────────────────────────────

const DEMO_NOTIFICATIONS: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [
  {
    type: 'promotion',
    title: 'Flash Sale Alert!',
    message: 'Electronics flash sale starts in 10 minutes! Up to 70% off on selected items.',
  },
  {
    type: 'promotion',
    title: 'Weekend Special',
    message: 'Buy 2 Get 1 Free on all fashion items this weekend only!',
  },
  {
    type: 'system',
    title: 'System Maintenance',
    message: 'Scheduled maintenance tonight at 2:00 AM EST. Expected downtime: 30 minutes.',
  },
  {
    type: 'system',
    title: 'New Feature Available',
    message: 'Order tracking is now real-time! Check your orders for live updates.',
  },
  {
    type: 'order',
    title: 'Order Processing',
    message: 'Your order #ORD-2847 is being prepared for shipment.',
    userId: 'user-1',
    data: { orderId: 'ORD-2847', status: 'processing' },
  },
  {
    type: 'inventory',
    title: 'Back in Stock!',
    message: 'Wireless Noise-Canceling Headphones are back in stock. Only 15 left!',
  },
]

const DEMO_ORDER_UPDATES: Omit<OrderUpdate, 'timestamp'>[] = [
  { orderId: 'ORD-2847', userId: 'user-1', status: 'confirmed', message: 'Your order has been confirmed and is being processed.' },
  { orderId: 'ORD-2847', userId: 'user-1', status: 'processing', message: 'Your order is being prepared for shipment.' },
  { orderId: 'ORD-2847', userId: 'user-1', status: 'shipped', message: 'Your order has been shipped!', estimatedDelivery: '2025-03-20' },
  { orderId: 'ORD-3102', userId: 'user-2', status: 'confirmed', message: 'Your order has been confirmed.' },
  { orderId: 'ORD-3102', userId: 'user-2', status: 'delivered', message: 'Your order has been delivered. Enjoy!', estimatedDelivery: '' },
]

const DEMO_STOCK_UPDATES: Omit<StockUpdate, 'timestamp'>[] = [
  { productId: 'prod-101', productName: 'Wireless Headphones', remainingStock: 15, totalStock: 100, flashSaleId: 'fs-1' },
  { productId: 'prod-102', productName: 'Smart Watch Pro', remainingStock: 3, totalStock: 50, flashSaleId: 'fs-1' },
  { productId: 'prod-103', productName: 'Bluetooth Speaker', remainingStock: 28, totalStock: 80, flashSaleId: 'fs-1' },
  { productId: 'prod-104', productName: 'Laptop Stand', remainingStock: 0, totalStock: 30, flashSaleId: 'fs-1' },
  { productId: 'prod-105', productName: 'USB-C Hub', remainingStock: 42, totalStock: 200, flashSaleId: 'fs-2' },
]

// ─── Socket.IO Connection Handling ───────────────────────────────────────────

io.on('connection', (socket: Socket) => {
  console.log(`[CONNECT] Socket connected: ${socket.id}`)

  // ─── join-room ──────────────────────────────────────────────────────────
  socket.on('join-room', (data: { userId: string; username: string; role?: string }) => {
    const { userId, username, role = 'customer' } = data

    // Leave previous user room if rejoining
    const existingUser = onlineUsers.get(socket.id)
    if (existingUser) {
      socket.leave(`user-${existingUser.id}`)
    }

    // Join user-specific room for targeted notifications
    socket.join(`user-${userId}`)
    // Join role-based room
    socket.join(`role-${role}`)
    // Join global announcements room
    socket.join('announcements')

    // Store online user info
    const onlineUser: OnlineUser = {
      id: userId,
      socketId: socket.id,
      username,
      role: role as OnlineUser['role'],
      joinedAt: new Date(),
    }
    onlineUsers.set(socket.id, onlineUser)

    // Send welcome notification
    const welcomeNotif: Notification = {
      id: generateId(),
      type: 'system',
      title: 'Welcome to ShopZone!',
      message: `Hello ${username}! You're now connected for real-time updates.`,
      userId,
      timestamp: new Date(),
      read: false,
    }
    socket.emit('notification', welcomeNotif)

    // Broadcast updated online users count
    io.emit('online-users', { count: onlineUsers.size, users: getOnlineUserList() })

    console.log(`[JOIN-ROOM] User ${username} (${userId}) joined rooms. Online: ${onlineUsers.size}`)
  })

  // ─── send-notification ──────────────────────────────────────────────────
  socket.on('send-notification', (data: { userId: string; notification: Omit<Notification, 'id' | 'timestamp' | 'read'> }) => {
    const { userId, notification } = data

    const fullNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date(),
      read: false,
    }

    // Send to specific user room
    io.to(`user-${userId}`).emit('notification', fullNotification)

    console.log(`[NOTIFICATION] Sent to user ${userId}: ${fullNotification.title}`)
  })

  // ─── order-update ───────────────────────────────────────────────────────
  socket.on('order-update', (data: { orderId: string; userId: string; status: string; message: string; estimatedDelivery?: string }) => {
    const orderUpdate: OrderUpdate = {
      ...data,
      timestamp: new Date(),
    }

    // Send order update to specific user
    io.to(`user-${data.userId}`).emit('order-update', orderUpdate)

    // Also send as a notification
    const notif: Notification = {
      id: generateId(),
      type: 'order',
      title: `Order ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}`,
      message: data.message,
      userId: data.userId,
      data: { orderId: data.orderId, status: data.status },
      timestamp: new Date(),
      read: false,
    }
    io.to(`user-${data.userId}`).emit('notification', notif)

    console.log(`[ORDER-UPDATE] Order ${data.orderId} -> ${data.status} for user ${data.userId}`)
  })

  // ─── chat-message ──────────────────────────────────────────────────────
  socket.on('chat-message', (data: { senderId: string; senderName: string; receiverId: string; receiverName: string; content: string }) => {
    const { senderId, senderName, receiverId, receiverName, content } = data
    const roomId = getChatRoomId(senderId, receiverId)

    const message: ChatMessage = {
      id: generateId(),
      senderId,
      senderName,
      receiverId,
      receiverName,
      content,
      timestamp: new Date(),
      roomId,
    }

    // Join both users to the chat room if not already
    socket.join(roomId)

    // Emit to the chat room (both sender and receiver)
    io.to(roomId).emit('chat-message', message)

    // Send notification to receiver if they're not in the chat room
    const notif: Notification = {
      id: generateId(),
      type: 'chat',
      title: `New message from ${senderName}`,
      message: content.length > 50 ? content.substring(0, 50) + '...' : content,
      userId: receiverId,
      data: { senderId, roomId },
      timestamp: new Date(),
      read: false,
    }
    io.to(`user-${receiverId}`).emit('notification', notif)

    // Clear typing indicator for sender
    const typingKey = `${socket.id}`
    const typingInfo = typingUsers.get(typingKey)
    if (typingInfo) {
      clearTimeout(typingInfo.timeout)
      typingUsers.delete(typingKey)
      io.to(roomId).emit('typing', { userId: senderId, username: senderName, isTyping: false })
    }

    console.log(`[CHAT] ${senderName} -> ${receiverName}: ${content.substring(0, 50)}`)
  })

  // ─── stock-update ───────────────────────────────────────────────────────
  socket.on('stock-update', (data: { productId: string; productName: string; remainingStock: number; totalStock: number; flashSaleId?: string }) => {
    const stockUpdate: StockUpdate = {
      ...data,
      timestamp: new Date(),
    }

    // Broadcast to all connected clients
    io.emit('stock-update', stockUpdate)

    // If stock is critically low, send notification to all users
    if (data.remainingStock <= 5 && data.remainingStock > 0) {
      const notif: Notification = {
        id: generateId(),
        type: 'inventory',
        title: 'Almost Sold Out!',
        message: `${data.productName} - Only ${data.remainingStock} left!`,
        data: { productId: data.productId, remainingStock: data.remainingStock },
        timestamp: new Date(),
        read: false,
      }
      io.emit('notification', notif)
    }

    // If sold out, send notification
    if (data.remainingStock === 0) {
      const notif: Notification = {
        id: generateId(),
        type: 'inventory',
        title: 'Sold Out!',
        message: `${data.productName} is now sold out. Check back later!`,
        data: { productId: data.productId },
        timestamp: new Date(),
        read: false,
      }
      io.emit('notification', notif)
    }

    console.log(`[STOCK-UPDATE] ${data.productName}: ${data.remainingStock}/${data.totalStock} remaining`)
  })

  // ─── typing ─────────────────────────────────────────────────────────────
  socket.on('typing', (data: { userId: string; username: string; receiverId: string; isTyping: boolean }) => {
    const { userId, username, receiverId, isTyping } = data
    const roomId = getChatRoomId(userId, receiverId)

    if (isTyping) {
      // Set a timeout to auto-clear typing indicator
      const typingKey = `${socket.id}`
      const existingTimeout = typingUsers.get(typingKey)
      if (existingTimeout) {
        clearTimeout(existingTimeout.timeout)
      }

      const timeout = setTimeout(() => {
        io.to(roomId).emit('typing', { userId, username, isTyping: false })
        typingUsers.delete(typingKey)
      }, 3000)

      typingUsers.set(typingKey, { roomId, timeout })
      io.to(roomId).emit('typing', { userId, username, isTyping: true })
    } else {
      const typingKey = `${socket.id}`
      const existingTimeout = typingUsers.get(typingKey)
      if (existingTimeout) {
        clearTimeout(existingTimeout.timeout)
        typingUsers.delete(typingKey)
      }
      io.to(roomId).emit('typing', { userId, username, isTyping: false })
    }
  })

  // ─── online-users ──────────────────────────────────────────────────────
  socket.on('online-users', () => {
    socket.emit('online-users', { count: onlineUsers.size, users: getOnlineUserList() })
  })

  // ─── disconnect ────────────────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    const user = onlineUsers.get(socket.id)

    if (user) {
      // Clean up typing indicators
      const typingKey = `${socket.id}`
      const typingInfo = typingUsers.get(typingKey)
      if (typingInfo) {
        clearTimeout(typingInfo.timeout)
        typingUsers.delete(typingKey)
        io.to(typingInfo.roomId).emit('typing', { userId: user.id, username: user.username, isTyping: false })
      }

      // Leave all rooms
      socket.leave(`user-${user.id}`)
      socket.leave(`role-${user.role}`)
      socket.leave('announcements')

      // Remove from online users
      onlineUsers.delete(socket.id)

      // Broadcast updated online users count
      io.emit('online-users', { count: onlineUsers.size, users: getOnlineUserList() })

      console.log(`[DISCONNECT] User ${user.username} (${user.id}) disconnected. Reason: ${reason}. Online: ${onlineUsers.size}`)
    } else {
      console.log(`[DISCONNECT] Unknown socket ${socket.id} disconnected. Reason: ${reason}`)
    }
  })

  // ─── error ─────────────────────────────────────────────────────────────
  socket.on('error', (error) => {
    console.error(`[ERROR] Socket error (${socket.id}):`, error)
  })
})

// ─── Demo Data Broadcasting ──────────────────────────────────────────────────

let demoIntervalCounter = 0

const runDemoBroadcast = () => {
  const cycleIndex = demoIntervalCounter % 8

  switch (cycleIndex) {
    case 0: {
      // Send a promotional notification to all
      const promoIndex = demoIntervalCounter % 2
      const demoNotif = DEMO_NOTIFICATIONS[promoIndex]
      const notification: Notification = {
        ...demoNotif,
        id: generateId(),
        timestamp: new Date(),
        read: false,
      }
      io.emit('notification', notification)
      console.log(`[DEMO] Broadcast promo notification: ${notification.title}`)
      break
    }
    case 1: {
      // Send order update to user-1
      const orderIndex = Math.floor(demoIntervalCounter / 8) % DEMO_ORDER_UPDATES.length
      const demoOrder = DEMO_ORDER_UPDATES[orderIndex]
      const orderUpdate: OrderUpdate = {
        ...demoOrder,
        timestamp: new Date(),
      }
      io.to('user-user-1').emit('order-update', orderUpdate)
      const orderNotif: Notification = {
        id: generateId(),
        type: 'order',
        title: `Order ${demoOrder.status.charAt(0).toUpperCase() + demoOrder.status.slice(1)}`,
        message: demoOrder.message,
        userId: demoOrder.userId,
        data: { orderId: demoOrder.orderId, status: demoOrder.status },
        timestamp: new Date(),
        read: false,
      }
      io.to('user-user-1').emit('notification', orderNotif)
      console.log(`[DEMO] Order update for user-1: ${demoOrder.orderId} -> ${demoOrder.status}`)
      break
    }
    case 2: {
      // Send stock update
      const stockIndex = demoIntervalCounter % DEMO_STOCK_UPDATES.length
      const demoStock = DEMO_STOCK_UPDATES[stockIndex]
      const stockUpdate: StockUpdate = {
        ...demoStock,
        remainingStock: Math.max(0, demoStock.remainingStock - Math.floor(demoIntervalCounter / 8)),
        timestamp: new Date(),
      }
      io.emit('stock-update', stockUpdate)
      console.log(`[DEMO] Stock update: ${stockUpdate.productName} -> ${stockUpdate.remainingStock} remaining`)
      break
    }
    case 3: {
      // Send system notification
      const sysIndex = 2 + (demoIntervalCounter % 2)
      const demoSys = DEMO_NOTIFICATIONS[sysIndex]
      const sysNotif: Notification = {
        ...demoSys,
        id: generateId(),
        timestamp: new Date(),
        read: false,
      }
      io.emit('notification', sysNotif)
      console.log(`[DEMO] Broadcast system notification: ${sysNotif.title}`)
      break
    }
    case 4: {
      // Simulate a chat message from "Seller Support" to user-1
      const chatMessages = [
        'Hi there! How can I help you today?',
        'Your return request for order #ORD-2847 has been approved.',
        'We have a special discount code for you: SHOPZONE20',
        'Your item has been packaged and is ready for pickup!',
        'Is there anything else you need help with?',
      ]
      const msgIndex = demoIntervalCounter % chatMessages.length
      const chatMsg: ChatMessage = {
        id: generateId(),
        senderId: 'seller-support',
        senderName: 'ShopZone Support',
        receiverId: 'user-1',
        receiverName: 'Demo User',
        content: chatMessages[msgIndex],
        timestamp: new Date(),
        roomId: getChatRoomId('seller-support', 'user-1'),
      }
      io.to('user-user-1').emit('chat-message', chatMsg)
      const chatNotif: Notification = {
        id: generateId(),
        type: 'chat',
        title: 'New message from ShopZone Support',
        message: chatMsg.content.length > 50 ? chatMsg.content.substring(0, 50) + '...' : chatMsg.content,
        userId: 'user-1',
        data: { senderId: 'seller-support', roomId: chatMsg.roomId },
        timestamp: new Date(),
        read: false,
      }
      io.to('user-user-1').emit('notification', chatNotif)
      console.log(`[DEMO] Chat message to user-1: ${chatMsg.content.substring(0, 50)}`)
      break
    }
    case 5: {
      // Send a targeted order notification
      const orderNotifDemo = DEMO_NOTIFICATIONS[4] // Order notification for user-1
      const notif: Notification = {
        ...orderNotifDemo,
        id: generateId(),
        timestamp: new Date(),
        read: false,
      }
      io.to('user-user-1').emit('notification', notif)
      console.log(`[DEMO] Targeted notification to user-1: ${notif.title}`)
      break
    }
    case 6: {
      // Send inventory notification
      const invNotifDemo = DEMO_NOTIFICATIONS[5]
      const notif: Notification = {
        ...invNotifDemo,
        id: generateId(),
        timestamp: new Date(),
        read: false,
      }
      io.emit('notification', notif)
      console.log(`[DEMO] Broadcast inventory notification: ${notif.title}`)
      break
    }
    case 7: {
      // Send a flash sale countdown update
      const flashSaleStock: StockUpdate = {
        productId: 'prod-101',
        productName: 'Wireless Headphones',
        remainingStock: Math.max(1, 15 - Math.floor(demoIntervalCounter / 8)),
        totalStock: 100,
        flashSaleId: 'fs-1',
        timestamp: new Date(),
      }
      io.emit('stock-update', flashSaleStock)
      console.log(`[DEMO] Flash sale countdown: ${flashSaleStock.remainingStock} left`)
      break
    }
  }

  demoIntervalCounter++
}

// Start demo broadcasts every 15 seconds
const DEMO_INTERVAL_MS = 15000
const demoTimer = setInterval(runDemoBroadcast, DEMO_INTERVAL_MS)

// ─── Server Startup ──────────────────────────────────────────────────────────

const PORT = 3003

httpServer.listen(PORT, () => {
  console.log(`\n🚀 ShopZone Notification Service running on port ${PORT}`)
  console.log(`📡 Socket.IO path: /`)
  console.log(`🌐 CORS: *`)
  console.log(`⏱️  Demo broadcasts every ${DEMO_INTERVAL_MS / 1000}s`)
  console.log(`\n📋 Supported events:`)
  console.log(`   → join-room        : Join user-specific room for notifications`)
  console.log(`   → send-notification: Send notification to specific user`)
  console.log(`   → order-update     : Broadcast order status updates`)
  console.log(`   → chat-message     : Handle real-time chat messages`)
  console.log(`   → stock-update     : Broadcast inventory changes`)
  console.log(`   → typing           : Chat typing indicators`)
  console.log(`   → online-users     : Track online user count`)
  console.log(`\n📤 Emitted events:`)
  console.log(`   ← notification     : Real-time notifications`)
  console.log(`   ← order-update     : Order status updates`)
  console.log(`   ← chat-message     : Chat messages`)
  console.log(`   ← stock-update     : Stock level updates`)
  console.log(`   ← typing           : Typing indicators`)
  console.log(`   ← online-users     : Online users list`)
  console.log('')
})

// ─── Graceful Shutdown ───────────────────────────────────────────────────────

const gracefulShutdown = (signal: string) => {
  console.log(`\n[SHUTDOWN] Received ${signal}, shutting down gracefully...`)
  clearInterval(demoTimer)
  io.disconnectSockets(true)
  httpServer.close(() => {
    console.log('[SHUTDOWN] Notification service closed')
    process.exit(0)
  })
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
