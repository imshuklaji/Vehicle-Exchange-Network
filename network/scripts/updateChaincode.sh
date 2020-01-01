#!/bin/bash

echo
echo " ____    _____      _      ____    _____ "
echo "/ ___|  |_   _|    / \    |  _ \  |_   _|"
echo "\___ \    | |     / _ \   | |_) |   | |  "
echo " ___) |   | |    / ___ \  |  _ <    | |  "
echo "|____/    |_|   /_/   \_\ |_| \_\   |_|  "
echo
echo "Updating Chaincode Vexnet On Vehicle Exchange Network"
echo
CHANNEL_NAME="$1"
DELAY="$2"
LANGUAGE="$3"
VERSION="$4"
TYPE="$5"
: ${CHANNEL_NAME:="pharmachannel"}
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

echo "New Version : "$VERSION

# import utils
. scripts/utils.sh

## Install new version of chaincode on peer0 and peer1 of all 5 orgs making them endorsers
echo "Updating chaincode on peer0.manufacturer.vehicle-exchange-network.com ..."
installChaincode 0 'manufacturer' $VERSION
echo "Updating chaincode on peer1.manufacturer.vehicle-exchange-network.com ..."
installChaincode 1 'manufacturer' $VERSION
echo "Updating chaincode on peer0.individual1.vehicle-exchange-network.com ..."
installChaincode 0 'individual1' $VERSION
echo "Updating chaincode on peer1.individual1.vehicle-exchange-network.com ..."
installChaincode 1 'individual1' $VERSION
echo "Updating chaincode on peer0.individual2.vehicle-exchange-network.com ..."
installChaincode 0 'individual2' $VERSION
echo "Updating chaincode on peer1.individual2.vehicle-exchange-network.com ..."
installChaincode 1 'individual2' $VERSION
echo "Updating chaincode on peer0.individual3.vehicle-exchange-network.com ..."
installChaincode 0 'individual3' $VERSION
echo "Updating chaincode on peer1.individual3.vehicle-exchange-network.com ..."
installChaincode 1 'individual3' $VERSION


# upgrade chaincode on the channel using peer0.manufacturer
echo "upgrading chaincode on channel using peer0.manufacturer.vehicle-exchange-network.com ..."
upgradeChaincode 0 'manufacturer' $VERSION

echo
echo "========= All GOOD, Chaincode Vexnet Is Now Updated To Version '$VERSION' =========== "
echo

echo
echo " _____   _   _   ____   "
echo "| ____| | \ | | |  _ \  "
echo "|  _|   |  \| | | | | | "
echo "| |___  | |\  | | |_| | "
echo "|_____| |_| \_| |____/  "
echo

exit 0
