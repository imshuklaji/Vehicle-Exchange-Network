#!/bin/bash

echo
echo " ____    _____      _      ____    _____ "
echo "/ ___|  |_   _|    / \    |  _ \  |_   _|"
echo "\___ \    | |     / _ \   | |_) |   | |  "
echo " ___) |   | |    / ___ \  |  _ <    | |  "
echo "|____/    |_|   /_/   \_\ |_| \_\   |_|  "
echo
echo "Deploying Chaincode Vexnet On Vehicle Network"
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
ORGS="manufacturer individual1 individual2 individual3"
TIMEOUT=15

if [ "$TYPE" = "basic" ]; then
  CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/"
else
  CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode-advanced/"
fi

echo "Channel name : "$CHANNEL_NAME

# import utils
. scripts/utils.sh

## Install new version of chaincode on peer0 and peer1 of all 5 orgs making them endorsers
echo "Installing chaincode on peer0.manufacturer.vehicle-exchange-network.com ..."
installChaincode 0 'manufacturer' $VERSION
echo "Installing chaincode on peer1.manufacturer.vehicle-exchange-network.com ..."
installChaincode 1 'manufacturer' $VERSION
echo "Installing chaincode on peer0.individual1.vehicle-exchange-network.com ..."
installChaincode 0 'individual1' $VERSION
echo "Installing chaincode on peer1.individual1.vehicle-exchange-network.com ..."
installChaincode 1 'individual1' $VERSION
echo "Installing chaincode on peer0.individual2.vehicle-exchange-network.com ..."
installChaincode 0 'individual2' $VERSION
echo "Installing chaincode on peer1.individual2.vehicle-exchange-network.com ..."
installChaincode 1 'individual2' $VERSION
echo "Installing chaincode on peer0.individual3.vehicle-exchange-network.com ..."
installChaincode 0 'individual3' $VERSION
echo "Installing chaincode on peer1.individual3.vehicle-exchange-network.com ..."
installChaincode 1 'individual3' $VERSION

# Instantiate chaincode on the channel using peer0.manufacturer
echo "Instantiating chaincode on channel using peer0.manufacturer.vehicle-exchange-network.com ..."
instantiateChaincode 0 'manufacturer' $VERSION

echo
echo "========= All GOOD, Chaincode Vexnet Is Now Installed & Instantiated On Vehicle Exchange Network =========== "
echo

echo
echo " _____   _   _   ____   "
echo "| ____| | \ | | |  _ \  "
echo "|  _|   |  \| | | | | | "
echo "| |___  | |\  | | |_| | "
echo "|_____| |_| \_| |____/  "
echo

exit 0
