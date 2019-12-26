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

		let companyBuffer= await ctx.stub.getState(companyKey).catch(err => console.log(err));
		let companyObject= JSON.parse(companyBuffer.toString());

		let newCarObj = {
			productId : productKey,
			carModelName : carModelName,
			manufacturer : companyKey
			ownerKey : companyKey,
			owner: companyObject.companyName,
			status : 'registered', 
			salePrice:'',
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
			carsOwned:'',
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

	carObject.ownerKey = userKey;
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


	 async function carSaleOrder(ctx,carSerialNo,name, aadharNo){

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



	if (userBuffer.length === 0)
			throw new Error('User: '+ name + ' with Aadhar Number: '+ aadharNo + 'not registered on the vehicle-exchange-network');

	if (carBuffer.length === 0)
			throw new Error('Car with carSerialNo: '+ carSerialNo + 'not registered on the vehicle-exchange-network');

	//fetch the details of the car with car-serial-no owned by this user and register it for sale
	if (carObject.ownerKey == userKey)
		{
			carObject.status = 'for-sale';
			carObject.salePrice = 500000;
			let dataBuffer = Buffer.from(JSON.stringify(carObject));
			await ctx.stub.putState(productKey, dataBuffer);
		}
		else{

			throw new Error('User: '+ name + ' with Aadhar Number: '+ aadharNo + 'not authorised to make this transaction');
		}

	}




	 async function viewCarsWithCompany(ctx,companyCRN,listofCars){

	 	const companyKey = ctx.stub.createCompositeKey('vehicle-exchange-network.com.company', [companyCRN]);

	 	let carswithCompanyArray =[];


	 	forEach(car : listofCars) {

	 		const productKey = ctx.stub.createCompositeKey('vehicle-exchange-network.com.car', [car.carSerialNo]);
	 		let carBuffer = await ctx.stub
				.getState(productKey)
				.catch(err => console.log(err));
			

			let carObject = JSON.parse(carBuffer.toString());

			if ( carObject.ownerKey == companyKey)
				carswithCompanyArray.push(productKey);


	 	}
	 	
	 	//return the array containing the list of the cars with company
	 	return carswithCompanyArray;

	 
	 }


	 async function viewCarAvailableForSale(ctx,listofCars){

	 	let saleCarArray=[];

	 	forEach(car : listofCars) {
	 		const productKey = ctx.stub.createCompositeKey('vehicle-exchange-network.com.car', [car.carSerialNo]);
	 		let carBuffer = await ctx.stub
				.getState(productKey)
				.catch(err => console.log(err));
			

			let carObject = JSON.parse(carBuffer.toString());

			if ( carObject.status === 'for-sale')
				saleCarArray.push(productKey);

	 	}

	 	//return the array containing the list of the cars with status for-sale
	 	return saleCarArray;

	 }


	 
	 async function createPurchaseOrder(ctx,buyerName,buyerAdhar,carName,amount,carSerialNo){

	 	const purchaseKey = ctx.stub.createCompositeKey('org.vehicle-exchange-network.purchase-order', [buyerName+'-'+buyerAdhar+'-'+carName]);
		const buyerKey = ctx.stub.createCompositeKey('org.vehicle-exchange-network.company', [buyerName+'-'+buyerAdhar]);

		let newPOObj = {
			poId : purchaseKey,
			carName : carName,
			carSerialNo:carSerialNo,
			carSerialNo : carSerialNo,
			buyerId : buyerKey,
			buyerName : buyerName,
			purchaseAmount : amount,
			status:'open',
			createdAt: new Date(),
			updatedAt: new Date(),
		};		

		let dataBuffer = Buffer.from(JSON.stringify(newPOObj));
		await ctx.stub.putState(purchaseKey, dataBuffer);
		return newPOObj;





	 }


	 async function viewPurchaseRequestsforOwnCar(ctx,name,aadharNo,listofOrders){

	 	const userKey = ctx.stub.createCompositeKey('org.vehicle-exchange-network.com.users', [name,aadharNo]);

	 	let ownCarOrders = [];

	 	forEach(order : listofOrders) {

	 		const productKey = ctx.stub.createCompositeKey('vehicle-exchange-network.com.car', [order.carSerialNo]);
	 		let carBuffer = await ctx.stub
				.getState(productKey)
				.catch(err => console.log(err));
			

			let carObject = JSON.parse(carBuffer.toString());

			if(carObject.ownerKey == userKey) 
				ownCarOrders.push(order.poId);

	 	}

	 	return ownCarOrders;
	}



	 async function purchaseReqeustApprovalRejection(ctx,buyerName,buyerAdhar,name,aadharNo,carName,carSerialNo){

	 	const productKey = ctx.stub.createCompositeKey('org.vehicle-exchange-network.com.car',[carSerialNo]);
	 	const userKey = ctx.stub.createCompositeKey('org.vehicle-exchange-network.com.users', [name,aadharNo]);
	 	const purchaseKey = ctx.stub.createCompositeKey('org.vehicle-exchange-network.purchase-order', [buyerName+'-'+buyerAdhar+'-'+carName]);
	 	const buyerKey = ctx.stub.createCompositeKey('org.vehicle-exchange-network.users', [buyerName+'-'+buyerAdhar]);
	 	let purchaseOrderBuffer = await ctx.stub
				.getState(purchaseKey)
				.catch(err => console.log(err));
			

		let purchaseObject = JSON.parse(purchaseOrderBuffer.toString());


		let carBuffer = await ctx.stub
				.getState(productKey)
				.catch(err => console.log(err));
			

			let carObject = JSON.parse(carBuffer.toString());



		if ((carObject.status === 'for-sale') && (carObject.ownerKey == userKey ) && 
			(purchaseObject.amount >= 50000) && (purchaseObject.status === 'open')) {

			//change the values of the respestive car object and purchase order

			purchaseObject.status = 'closed';
			carObject.ownerKey = buyerKey;
			carObject.owner: buyerName;
			carObject.status : 'registered';
			carObject.salePrice : purchaseObject.purchaseAmount;
			carObject.transferHistory.push(buyerKey) ;

			//save the changed values

			let dataBuffer = Buffer.from(JSON.stringify(carObject));
			await ctx.stub.putState(productKey, dataBuffer);

			let dataBuffer2 = Buffer.from(JSON.stringify(purchaseObject));
			await ctx.stub.putState(purchaseKey, dataBuffer2);

		}


	}



	async function viewCarOwnershipTransferHistory(ctx,carSerialNo){

	const productKey = ctx.stub.createCompositeKey('org.vehicle-exchange-network.com.car',[carSerialNo]);

	//return the history as per the product key all transfer 
		return await this.ctx.stub.getHistoryForKey(productKey);

	/*

	let carBuffer = await ctx.stub
				.getState(productKey)
				.catch(err => console.log(err));
			

	let carObject = JSON.parse(carBuffer.toString());

	return carObject.transferHistory;

	*/


	 }


	 
	 module.exports = VexnetContract;
}
