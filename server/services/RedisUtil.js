var Util          = require('../services/Util');
var redis         = require('redis');
var redisUtil = 
{
	 redisClient        : redis.createClient(Util.getRedisPort(), Util.getRedisHost()),
}
module.exports = 
{
	getRedisClient		: function()
	{
		return redisUtil.redisClient;
	},
	sadd				: function( key, value, callback )
	{
		redisUtil.redisClient.sadd( [key, value], callback);
	}, 
	srem				: function( key, value, callback )
	{
		redisUtil.redisClient.srem( key, value, callback );
	},   
	smembers			: function( key, callback )
	{
		console.log("Key in smembers"+key);
		redisUtil.redisClient.smembers(key, callback);
	},
	set					: function(key, value, callback)
	{
		redisUtil.redisClient.set(key, value, callback);
	},
	get 				: function(key)
	{
		redisUtil.redisClient.get(key, callback);
	},
	lpush			    :  function(key, value, callback)
	{
		redisUtil.redisClient.lpush([key, value], callback)
	},
	lrange			    :  function(key, callback)
	{
		redisUtil.redisClient.lrange( key, 0, -1, callback);
	},
}