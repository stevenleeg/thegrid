var GameClient = (function() {
	var ws;
	var callbacks = {};

	function connect(callback) {
		ws = new WebSocket("ws://localhost:8080/api/socket");
		ws.onopen = callback; 
		ws.onmessage = newMessage;
		ws.onclose = closeSocket;
	}

	function send(func, data, callback) {
		// Generate a random callback identifier
		cid = parseInt(Math.random() * 100);

		data['f'] = func
		data['cid'] = cid
		ws.send(JSON.stringify(data));
		callbacks[cid] = callback;
	}

	function newMessage(evt) {
		data = JSON.parse(evt.data);
		// Run the callback for the identifier we get back
		callbacks[data['cid']](data);
		delete callbacks[data['cid']]
	}

	function closeSocket() {
		
	}

	return {
		"connect": connect,
		"send": send,
		"callbacks":callbacks
	};
})();
