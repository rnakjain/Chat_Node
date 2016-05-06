
module.exports = 
{
	handshakeMessageModel	: function( clientId, successful )
	{
		return [{
			clientId	: clientId,
			successful 	: successful, 
			channel	    : '/meta/handshake'
		}];
	},
	subscriptionModel		: function(clientId, successful, subscription)
	{
		return [{
			clientId	: clientId,
			successful 	: successful, 
			channel	    : '/meta/subscribe',
			subscription: subscription
		}];
	},
	unsubscriptionModel		: function(clientId, successful, subscription)
	{
		return [{
			clientId	: clientId,
			successful 	: successful, 
			channel	    : '/meta/unsubscribe',
			subscription: subscription
		}];
	},
	serverAckModel			: function(id)
	{
		return [{
			id	: id,
			channel	    : '/meta/serverack'
		}];
	},
	messageValidationModel	: function( isValid, channel, message )
	{
		return {
			isValid 	: isValid,
			channel		: channel,
			message 	: message
		}
	},
	messagePublishModel		: function(channel, message)
	{
		return [{
			channel 	: channel,
			message		: message
		}]
	}
}