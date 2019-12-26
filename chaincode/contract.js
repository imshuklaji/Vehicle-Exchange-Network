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

	// Register car company on the network who will be able to create the car asset
	async function registerCompany (ctx, companyCRN, companyName, location){

		//create the key for the car company 
		const companyKey = ctx.stub.createCompositeKey('vehicle-exchange-network.com.company', [companyCRN]);
		const companyId = ctx.stub.createCompositeKey('vehicle-exchange-network.com.company', [companyCRN+'-'+companyName]);

		//create the company object to be stored on the ledger
		let newCompanyObj = {
			companyId : companyId
			companyName : companyName,
			location : location,
			createdAt: new Date(),
			updatedAt: new Date(),
		};		

		//create the buffer and then put that buffer on ledger
		let dataBuffer = Buffer.from(JSON.stringify(newCompanyObj));
		await ctx.stub.putState(companyKey, dataBuffer);
		return newCompanyObj;


	}




	// Register the new car on the network

	 async function addCar(ctx,carSerialNo,carModelName,mfgDate,companyCRN) {

	 	const productKey = ctx.stub.createCompositeKey('vehicle-exchange-network.com.car', [carSerialNo]);
		const companyKey = ctx.stub.createCompositeKey('vehicle-exchange-network.com.company', [companyCRN]);

		//validate that the intiator of the transaction if car company
		this.validateInitiator(ctx, carOrg);

		//Fetch the company details saved on the ledger and then use that object to register the company name for car

		let companyBuffer= await ctx.stub.getState(propertyKey).catch(err => console.log(err));
		let companyObject= JSON.parse(propertyBuffer.toString());

		let newCarObj = {
			productId : productKey,
			carName : carName,
			manufacturer : companyKey
			owner : companyObject.companyName,
			transferHistory : companyKey,  // variable which will be used to track the transfer of the car ownership
			createdAt: new Date(),
			updatedAt: new Date(),
		};		

		let dataBuffer = Buffer.from(JSON.stringify(newCarObj));
		await ctx.stub.putState(productKey, dataBuffer);
		return newCarObj;



	 }


	 //Function to register the individuals on the system ( This can be done by IND1,IND2,IND3 Org)

	 async registerNewUser(ctx, name, email, phone, aadharNo,location)
	{
		// Create a new composite key for the new request
		const userKey = ctx.stub.createCompositeKey('org.vehicle-exchange-network.com.users', [name,aadharNo]);
		
		//Create the user object for savings the details of the user
		let newUserObject={
			userID: userKey,
			name: name,
			email: email,
			aadharNo: aadharNo,
			phone: phone,
			location : location,
			createdAt: new Date()
		};
		// Convert the JSON object to a buffer and send it to blockchain for storage
		let dataBuffer = Buffer.from(JSON.stringify(newUserObject));
		await ctx.stub.putState(userKey, dataBuffer);
		// Return value of new user account created 
		return newUserObject;
	}




	 /* Function to transfer the ownership from Car company to individual */
	 async function changeOwner(ctx,name, aadharNo,carSerialNo){

	 //Validate that this transaction is to be intitiated by the Car Company
	 this.validateInitiator(ctx, carOrg);

	 //Create the keys of the users 
	 const userKey = ctx.stub.createCompositeKey('org.vehicle-exchange-network.com.users', [name,aadharNo]);
	 const productKey = ctx.stub.createCompositeKey('vehicle-exchange-network.com.car', [carSerialNo]);

	 // First fetch the details of the user and the car and then save the updated owner 

	 let carBuffer = await ctx.stub
				.getState(productKey)
				.catch(err => console.log(err));
			

	let carObject = JSON.parse(carBuffer.toString());

	let userBuffer = await ctx.stub
				.getState(userKey)
				.catch(err => console.log(err));
			

	let userObject = JSON.parse(userBuffer.toString());

	carObject.owner = userObject.name; //change the ownership to username 
	carObject.transferHistory.push(userKey); // push the userkey in transfer history object

	//save the updated details in the buffer
	let dataBuffer = Buffer.from(JSON.stringify(carObject));
			await ctx.stub.putState(productKey, dataBuffer);
	}


	 /* Function to view the owner of the Car */

	 async function viewCarOwner(ctx,carSerialNo) {

	 const productKey = ctx.stub.createCompositeKey('vehicle-exchange-network.com.car', [carSerialNo]);

	  let carBuffer = await ctx.stub
				.getState(productKey)
				.catch(err => console.log(err));
			

	let carObject = JSON.parse(carBuffer.toString());

	//return the car owner at present
	return carObject.owner;

	 }


	 /* Below set of the functions are for the Individuals ****** */


	 async function carSaleOrder(){

	 }


	 async function viewCarWithCompany(){

	 }


	 async function viewCarAvailableForSale(){

	 }


	 async function viewCarOwnershipTransferHistory(){

	 }

	 async function createPurchaseOrder(){

	 }


	 async function viewPurchaseRequestsforOwnCar(){

	 }



	 async function purchaseReqeustApprovalRejection(){

	 }


	 module.exports = VexnetContract;
}
