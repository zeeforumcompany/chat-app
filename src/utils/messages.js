const generateMessage = (username, text) => {
	return {
		msg: text,
		username,
		createdAt: new Date().getTime()
	}
}

const generateLocationMessage = (username, url) => {
	return {
		url,
		username,
		createdAt: new Date().getTime()
	}
}

module.exports = {
	generateMessage,
	generateLocationMessage
}