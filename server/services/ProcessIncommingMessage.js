var ClientManager           = require('../services/ClientManager');
var MessageModels           = require('../models/messageModel.js');

var ProcessIncommingMessage = 
{
   
}
module.exports = 
{
    validateIncommingMessage        :    function(ws, msg)
    {
        var isValid     = false;
        try
        {
            var messageList = [];
            var message     = {};
            var channel     = null;
            var response    = undefined;
            console.log('Inside processIncomingMessage: '+msg);

            messageList     = JSON.parse(msg);
            message         = messageList[0];
            
            if( message )
            {
                channel     = message.channel;

                if(channel && channel != "null")
                {
                    if( !ClientManager.authenticateClient(ws, message))
                    {
                        ClientManager.disconnect(ws);
                        return;
                    }
                    response    =   MessageModels.messageValidationModel( true, channel, message );
                }
            }
    
        }
        catch(e)
        {
            console.log("Exception: "+e)
        }
        return response;
    }, 
    processMessage         :   function(channel, message, ws)
    {
        try
        {

             if(channel == "/meta/subscribe")
                ClientManager.doSubscription(ws, message);
            else if(channel == "/meta/unsubscribe")
                ClientManager.doUnSubscription(ws, message);
            


            if( !channel.startsWith('/meta/')   )
            {
                ClientManager.publishToSubscribedClients(channel, message, ws);
            }

            // if("/meta/pingpong".equals(channel))
            //     //manageClinets.recievePongFromClient(dataMap); 
            // else if("/meta/subscribe".equals(channel))
            //     doSubscription(channel, dataMap, pSession);
            // else if("/meta/unsubscribe".equals(channel))
            //     doUnSubscription(channel, dataMap, pSession);
            // else if(channel.startsWith("/groupChat/"))
            //     groupChatActions(channel, dataMap, pSession);
            // else if(channel.startsWith("/fullspectrum/"))
            //     fullClientChat(channel, dataMap, pSession);
            // else if(channel.startsWith("/monitor/"))
            //     dispatchActions(channel, dataMap, pSession);

            // if(!channel.startsWith("/meta/"))
            //     publishToSubscribedClients(channel, dataMap, pSession);
        }
        catch(e)
        {

        }
    },











}