const mongoose = require('mongoose');
const redis 	 = require('redis');
const util 		 = require('util');
const keys     = require('../config/keys')

const client 	 = redis.createClient(keys.redisUrl);
client.hget 	 = util.promisify(client.hget);
const exec  	 = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey  = JSON.stringify(options.key || 'default');
  return this;
};

mongoose.Query.prototype.exec = async function () {
  //check that chache is here or note
  if(!this.useCache){
    return exec.apply(this, arguments)
  };

  // generating the unique and consistent key
  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
     collection: this.mongooseCollection.name } ));

  // check the cached value
  const cachedValue = await client.hget(this.hashKey, key);

  //if yes, get the cachedValue
  if(cachedValue){
   		const doc = JSON.parse(cachedValue);
   		return Array.isArray(doc)
              ? doc.map(d => new this.model(d)) // if Array
              : new this.model(doc);            // if not an Array , here's object
  };

  // if no, get the value from the database
  const result = await exec.apply(this, arguments);

  client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
  return result;
}

module.exports = {
  clearCache(hashKey){
    client.del(JSON.stringify(hashKey));
  }
};
