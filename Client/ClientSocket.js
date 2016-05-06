var webSocket = {
    
    url : '',
    clientId : '',
    messageMap : {},
    metaId : 0,
    socket : undefined,
	handshake	:	function(url)
	{
        
		if(webSocket.socket == null || webSocket.socket == undefined)
		{
			webSocket.socket = new WebSocket(url);
		}
		//Show a connected message when the WebSocket is opened.
		webSocket.socket.onopen = function(event) 
		{
			console.log(webSocket.socket.id);
		};
		//Handle any errors that occur.
		webSocket.socket.onerror = function(error) 
		{
		  console.log('WebSocket Error: ' + error);
		};
		//Handle messages sent by the server.
		webSocket.socket.onmessage = function(event) 
		{
			 
		};
		webSocket.socket.onclose = function(event) 
		{
		  console.log("onclose of "+webSocket.clientId);
		  webSocket.socket = undefined;
		};
	
    }
};
webSocket.handshake('ws://localhost:8080/');