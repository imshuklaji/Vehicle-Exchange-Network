'use strict';

const {Contract} = require('fabric-contract-api');
const utilsclass = require('./utils');

class VexnetContract extends Contract {

	constructor() {
		// Provide a custom name to refer to this smart contract
        super('org.vehicle-exchange-network.vexnet');
		global.utils = new utilsclass();

        //These Global variables are used to store the organisation names of the organisations participating in the network.
		global.ind1Org = 'ind1.vehicle-exchange-network.com';
		global.ind2Org = 'ind2.vehicle-exchange-network.com';
		global.ind3Org = 'ind3.vehicle-exchange-network.com';
		global.carOrg = 'carcompany.vehicle-exchange-network.com';
	}


	// Function to check for the intitiator of the transaction 
	validateInitiator(ctx, initiator)
	{
		const initiatorID = ctx.clientIdentity.getX509Certificate();
		console.log(initiator); 
		if(initiatorID.issuer.organizationName.trim() !== initiator)
		{
				throw new Error('Not authorized to initiate the transaction: ' + initiatorID.issuer.organizationName + ' not authorised to initiate this transaction');
		}
	}


	
	/* ****** All custom functions are defined below ***** */
	
	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('Vexnet Smart Contract Instantiated');
	}


	/* Below set of the functions are for the Car Company ****** */

	
	// Register the new car on the network

	 async function addCar(ctx,carSerialNo,carModelName,mfgDate,companyCRN) {


	 }


	 /* Function to transfer the ownership from Car company to individual */
	 async function changeOwner(){

	 }


	 /* Function to view the owner of the Car */

	 async function viewCarOwner() {

	 }

}
