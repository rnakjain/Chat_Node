var ClientManager           = require('../services/ClientManager.js');
var ProcessIncommingMessage = require('../services/ProcessIncommingMessage');

var WebSocketServer = require('ws').Server, wss = new WebSocketServer({port: 8080});

var obj = {};

wss.on('connection', function(ws) 
{
    ClientManager.setClientSession(ws);
    ClientManager.publishValidationKey(ws);

    ws.on('message', function(message) 
    {
        var validataionResp     =   ProcessIncommingMessage.validateIncommingMessage( ws, message );
        if(validataionResp && validataionResp.isValid)
        {
            ClientManager.sendServerAck( ws, validataionResp.message );
            ProcessIncommingMessage.processMessage( validataionResp.channel, validataionResp.message, ws );
        }
    });

    ws.on('close', function(error_code) 
    {
        console.log(ws.id+" : disconnected")
        ClientManager.removeClientSession(ws);
        console.log('some client is closed: %s', error_code);
    });

    ws.on('error', function(error_code) 
    {
        console.log("associated id "+ws.id);
        ClientManager.removeClientSession(ws);
        //ClientManager.getClientIdbySocket(ws);
        console.log('some client is closed: %s', error_code);
    });
    //console.log(ws);
});

