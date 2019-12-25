'use strict';

const {Contract} = require('fabric-contract-api');
const utilsclass = require('./utils');

class VexnetContract extends Contract {

	constructor() {
		// Provide a custom name to refer to this smart contract
        super('org.vehicle-exchange-network.vexnet');
		global.utils = new utilsclass();

        //These Global variables are used to store the organisation names of the organisations participating in the network.
		global.usersOrg = 'users.vehicle-exchange-network.com';
		global.carOrg = 'carcompany.vehicle-exchange-network.com'
	}


}
