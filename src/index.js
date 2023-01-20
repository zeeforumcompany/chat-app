const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {
	addUser,
	getUser,
	getUsersInRoom,
	removeUser
} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, '../public')))

io.on('connection', (socket) => {

	socket.on('join', (options, callback) => {
		const {user, error} = addUser({
			id: socket.id,
			...options
		})

		if (error) {
			return callback(error)
		}

		socket.join(user.room)

		socket.emit('message', generateMessage('Admin', 'Welcome!'))
		socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${options.username} has joined.`))
		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room)
		})

		callback()
	})

	socket.on('sendMessage', (message, callback) => {
		const filter = new Filter()

		if (filter.isProfane(message)) {
			return callback('Profanity is not allowed.')
		}

		const user = getUser(socket.id)

		io.to(user.room).emit('message', generateMessage(user.username, message))
		callback()
	})

	socket.on('disconnect', () => {
		const user = removeUser(socket.id)

		if (user) {
			io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left.`))
			io.to(user.room).emit('roomData', {
				room: user.room,
				users: getUsersInRoom(user.room)
			})
		}
	})

	socket.on('sendLocation', (location, callback) => {
		const user = getUser(socket.id)
		io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://www.google.com/maps/?q=${location.latitude},${location.longitude}`))
		callback()
	})
})


const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`)
})