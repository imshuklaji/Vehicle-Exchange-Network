#!/bin/bash

echo
echo " ____    _____      _      ____    _____ "
echo "/ ___|  |_   _|    / \    |  _ \  |_   _|"
echo "\___ \    | |     / _ \   | |_) |   | |  "
echo " ___) |   | |    / ___ \  |  _ <    | |  "
echo "|____/    |_|   /_/   \_\ |_| \_\   |_|  "
echo
echo "Deploying Chaincode VEXNET On Vehicle Exchange Network"
echo
CHANNEL_NAME="$1"
DELAY="$2"
LANGUAGE="$3"
VERSION="$4"
TYPE="$5"
: ${CHANNEL_NAME:="vehicleexchangechannel"}
: ${DELAY:="5"}
: ${LANGUAGE:="node"}
: ${VERSION:=1.1}
: ${TYPE="basic"}

LANGUAGE=`echo "$LANGUAGE" | tr [:upper:] [:lower:]`
ORGS="carcompany ind1 ind2 ind3"
TIMEOUT=15
CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/"


echo "Channel name : "$CHANNEL_NAME

# import utils
. scripts/utils.sh

## Install new version of chaincode on peer0 of all 4 orgs making them endorsers
echo "Installing chaincode on peer0.carcompany.vehicle-exchange-network.com ..."
installChaincode 0 'carcompany' $VERSION
echo "Installing chaincode on peer1.ind1.vehicle-exchange-network.com ..."
installChaincode 0 'ind1' $VERSION
echo "Installing chaincode on peer0.ind2.vehicle-exchange-network.com ..."
installChaincode 0 'ind2' $VERSION
echo "Installing chaincode on peer0.ind3.vehicle-exchange-network.com ..."
installChaincode 0 'ind3' $VERSION

# Instantiate chaincode on the channel using peer0.carcompany
echo "Instantiating chaincode on channel using peer0.carcompany.vehicle-exchange-network.com ..."
instantiateChaincode 0 'carcompany' $VERSION

echo
echo "========= All GOOD, Chaincode VEXNET Is Now Installed & Instantiated On Vechile Exchange Network =========== "
echo

echo
echo " _____   _   _   ____   "
echo "| ____| | \ | | |  _ \  "
echo "|  _|   |  \| | | | | | "
echo "| |___  | |\  | | |_| | "
echo "|_____| |_| \_| |____/  "
echo

exit 0
