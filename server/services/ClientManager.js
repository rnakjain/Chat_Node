var Util          = require('../services/Util');
var MessageModels = require('../models/messageModel.js');
var RedisUtil     = require('../services/RedisUtil');
var ClientManager = 
{
    redisClient               : RedisUtil.getRedisClient(),
    clientsSessionbyId        : {},
    publish                   : function( message, ws )
    {
      try
      {
          ws.send(JSON.stringify(message));
      }
      catch(e)
      {
        console.log("Exception in publish Data:"+JSON.stringify(message)+" :Exception: "+e);
      }
    },

    getSubscriptionKey        : function( channel )
    {
      return Util.getNodeId()+channel;
    },

    removeDisconnectedClients : function( clientList, subscriptionKey )
    {

      try
      {
        function callback( err, reply )
        {
           console.log(" removeDisconnectedClients callback:: "+reply);
        }
        for( var index = 0 , length = clientList.length ; index < length ; index++ ) 
        {
          RedisUtil.srem(subscriptionKey, clientList[index], callback);
        }
      }
      catch(e)
      {
        console.log("Exception in publish Data:"+JSON.stringify(message)+" :Exception: "+e);
      }
    }
}

module.exports = 
{
  setClientSession          : function ( ws ) 
  {
      var clientId = Util.getClientId();
      ws.id        = clientId;
      ClientManager.clientsSessionbyId[clientId]  =   ws;
      
      console.log("ClientId: "+clientId);
  },

  removeClientSession       : function( ws )
  {
    delete ClientManager.clientsSessionbyId[ws.id];
  },

  getSocketById : function(clientId)
  {
      return ClientManager.clientsSessionbyId[clientId];
  },

  authenticateClient       : function (ws, message) 
  {
      var isAuthorized  =   false;
      var dataMap       =   {};
      var clientId      =   undefined;
      
      try
      {
        if( message.clientId )
        {
            clientId    =   message.clientId;
        }
        else if( message.data )
        {
            dataMap  =   message.data;
            clientId =   dataMap.clientId;
        }
        if( clientId && clientId != "null" )
        {
            if( ws.id == clientId )
            {
                isAuthorized    =   true;
            }
        }           
      }
      catch(e)
      {
          console.log(e);
      }
      console.log("isAuthorizedMessage: "+isAuthorized+" clientId: "+clientId);
      return isAuthorized;
  },

  disconnect               : function( ws )
  {
     try
     {
       ws.close();
     }
     catch(e)
     {
         console.log("Exception in disconnect: "+e)
     }
  },

  sendServerAck          : function(ws, message)
  {
    try
    {
      var metaMap = message["metaMap"];
      if( metaMap && metaMap["id"])
      {
          var messageList = MessageModels.serverAckModel(metaMap["id"]);
          ClientManager.publish(messageList, ws);
      }
    }
    catch(e)
    {
        console.log("Exception in sendServerAck: data: "+JSON.stringify(message)+" Exception: "+e);
    }
  },

  publishValidationKey    : function(ws)
  {
     try
     {
        var clientId    =   ws.id;
        var messageList =   MessageModels.handshakeMessageModel(clientId,true);
        ClientManager.publish(messageList, ws);
     }
     catch(e)
     {
        console.log("Exception in publishValidationKeyToClient: data: "+clientId+" Exception: "+e);
     }
  },

  doSubscription        : function(ws, message)
  {

    var subscriptionResp    = MessageModels.subscriptionModel(  undefined, false, undefined );
    console.log("Subscription function");

    try
    {
        if(message && message["subscription"] && message["subscription"] != null)
        {
            var subscriptionChannel = message["subscription"];
            var clientId            = message["clientId"];

            function callback( err, reply )
            {
              console.log("ClientId: "+clientId+" :subscriptionChannel: "+subscriptionChannel)
                if(!err)
                {
                    subscriptionResp = MessageModels.subscriptionModel(clientId, true, subscriptionChannel);
                    ClientManager.publish(subscriptionResp, ws);
                }
                else
                {

                    subscriptionResp = MessageModels.subscriptionModel(clientId, false, subscriptionChannel);
                    ClientManager.publish(subscriptionResp, ws);
                }
            }

            console.log("Going to call with callback param");
            RedisUtil.sadd( ClientManager.getSubscriptionKey(subscriptionChannel), clientId, callback);
        }
        else
        {
                ClientManager.publish(subscriptionResp, ws);
        }
    }
    catch(e)
    {
        console.log("Exception in doSubscription: data: "+clientId+" Exception: "+e);
        ClientManager.publish(subscriptionResp, ws);
    }
  },

  doUnSubscription      :   function( ws, message )
  {
    var subscriptionResp    = MessageModels.unsubscriptionModel(  undefined, false, undefined );
    try
    {
        if(message && message["subscription"] && message["subscription"] != null)
        {
            var subscriptionChannel = message["subscription"];
            var clientId            = message["clientId"];

            function callback( err, reply )
            {
              console.log("ClientId: "+clientId+" :subscriptionChannel: "+subscriptionChannel)
                if(!err)
                {
                    subscriptionResp = MessageModels.unsubscriptionModel(clientId, true, subscriptionChannel);
                    ClientManager.publish(subscriptionResp, ws);
                }
                else
                {
                    subscriptionResp = MessageModels.unsubscriptionModel(clientId, false, subscriptionChannel);
                    ClientManager.publish(subscriptionResp, ws);
                }
            }
            RedisUtil.srem( ClientManager.getSubscriptionKey(subscriptionChannel), clientId, callback);
        }
        else
        {
                ClientManager.publish(subscriptionResp, ws);
        }
    }
    catch(e)
    {
        console.log("Exception in doSubscription: data: "+clientId+" Exception: "+e);
        ClientManager.publish(subscriptionResp, ws);
    }
  },
  
  publishToSubscribedClients  :   function( channel, message, ws )
  {
    try
    {
      var subscriptionKey   = ClientManager.getSubscriptionKey(channel) 
        if(message && message['data'])
        {
          var disconnected_Clients = [];
          var messageToPublish  = MessageModels.messagePublishModel(channel, message['data']);
          function callback( err, reply )
            {
                if(!err)
                {
                    var subscriptionList  = reply;
                    for( var index = 0 , length = subscriptionList.length ; index < length ; index++ ) 
                    {
                        var ws = ClientManager.clientsSessionbyId[subscriptionList[index]];
                        if(ws)
                        {
                          ClientManager.publish(messageToPublish, ws);
                        }
                        else
                        {
                          disconnected_Clients.push(subscriptionList[index]);
                        }
                    }
                    ClientManager.removeDisconnectedClients(disconnected_Clients, subscriptionKey)
                }
                else
                {
                  console.log("Fatal error: Unable to attempt publish from server:"+JSON.stringify(message)+" : channel : "+channel);
                }
            }
          RedisUtil.smembers( subscriptionKey, callback );

        }
    }
    catch(e)
    {
      console.log("Fatal error: Unable to attempt publish from server:"+JSON.stringify(message)+" : channel : "+channel);
    }  
  },

};