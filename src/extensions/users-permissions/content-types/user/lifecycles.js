const {userLogger} = require('./utilities/logger');

module.exports = {
  afterCreate(event) {
    const { result, params } = event;
    console.log(result);
    userLogger.info(`User created with ID: ${result.id}, username: ${result.attributes.name}`);
  },
  afterDelete(event) {
    const { result, params } = event;
    console.log(result);
    userLogger.info(`User deleted with ID: ${result.id}, username: ${result.attributes.name}`);
  }
};
