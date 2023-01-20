const socket = io()

const $messageForm = document.querySelector('.chatForm')
const $messageFormInput = document.querySelector('.message')
const $messageFormButton = document.querySelector('.sendButton')
const $locationButton = document.querySelector('#sendLocation')
const $users = document.querySelector('.chat__sidebar')
const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML
const usersTemplate = document.querySelector('#users-template').innerHTML

const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true
})

const autoScroll = () => {
	const $newMessage = $messages.lastElementChild
	const newMessageStyles = getComputedStyle($newMessage)
	const newMessageMargin = parseInt(newMessageStyles.marginBottom)
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
	const visibleHeight = $messages.offsetHeight
	const containerHeight = $messages.scrollHeight
	const scrollOffset = $messages.scrollTop + visibleHeight

	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = containerHeight
	}
}

socket.on('message', ({username, msg, createdAt}) => {
	const html = Mustache.render(messageTemplate, {
		message: msg,
		username,
		createdAt: moment(createdAt).format('YYYY-MM-DD HH:mm:ss')
	})
	$messages.insertAdjacentHTML('beforeend', html)
	autoScroll();
})

socket.on('locationMessage', ({username, url, createdAt}) => {
	const html = Mustache.render(locationTemplate, {
		url,
		username,
		createdAt: moment(createdAt).format('YYYY-MM-DD HH:mm:ss')
	})

	$messages.insertAdjacentHTML('beforeend', html)
	autoScroll();
})

socket.on('roomData', ({ room, users }) => {
	const html = Mustache.render(usersTemplate, {
		room,
		users
	})

	$users.innerHTML = html
})

$messageForm.addEventListener('submit', (event) => {
	event.preventDefault()

	$messageFormButton.setAttribute('disabled', 'disabled')

	socket.emit('sendMessage', $messageFormInput.value, (error) => {
		$messageFormButton.removeAttribute('disabled')
		$messageFormInput.value = ""
		$messageFormInput.focus()

		if (error) {
			return alert(error)
		}
	})
})

$locationButton.addEventListener('click', (evt) => {
	if (!navigator.geolocation) {
		return alert('Geolocation not supported by your browser!')
	}

	$locationButton.setAttribute('disabled', 'disabled')

	navigator.geolocation.getCurrentPosition((position) => {
		let latitude = position.coords.latitude
		let longitude = position.coords.longitude

		socket.emit('sendLocation', {
			latitude,
			longitude
		}, (error) => {
			$locationButton.removeAttribute('disabled')
			if (error) {
				return alert(error)
			}

			return alert('Location shared!')
		})
	});
})

socket.emit('join', {
	username,
	room
}, (error) => {
	if (error) {
		alert(error)
		location.href = "/"
	}
})