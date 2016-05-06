var ApplicationResource          = require('../services/ApplicationResource');
Util  = 
{
  mode              : "staging",
  nodeId            : "",
  createUUId        : function () 
  {
    function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
  },
}

module.exports = 
{
  getClientId   :   function()
  {
    return Util.createUUId();
  },
  getRedisHost  :   function()
  {
    if(Util.mode == "live")
      return "";
    else
      return ApplicationResource.staging_redis_host;
  },
  getRedisPort  :   function()
  {
    if(Util.mode == "live")
      return "";
    else
      return ApplicationResource.staging_redis_port
  },
  getNodeId  : function()
  {
    if(!Util.nodeId)
      Util.nodeId  =  Util.createUUId();
    return Util.nodeId;
  }
};