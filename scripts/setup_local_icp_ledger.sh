#!/bin/bash

# Stop the script if any command fails
set -e

# Define a function to log messages
log() {
  echo "=> $1"
}

dfx identity use minter
export MINTER_ACCOUNT_ID=$(dfx ledger account-id)

# Check if the first argument is provided
if [ -z "$1" ]; then
  log "No initial wallet argument provided, setting default value"
  INITIAL_BALANCE_WALLET="50b8f65b44da77a854442bcf5ab3cc3711c4a2fc868f9a7b0c85fbeb37c00b53"
else
  log "Setting initial balance wallet from argument"
  INITIAL_BALANCE_WALLET=$1
fi


# log "Switching back to default identity"
# dfx identity use default
# export DEFAULT_ACCOUNT_ID=$(dfx ledger account-id)

log "Deploying the ledger canister"
dfx deploy --mode reinstall --specified-id ryjl3-tyaaa-aaaaa-aaaba-cai icp_ledger_canister --argument "
  (variant {
    Init = record {
      minting_account = \"$MINTER_ACCOUNT_ID\";
      initial_values = vec {
        record {
          \"$INITIAL_BALANCE_WALLET\";
          record {
            e8s = 10_001_000_000 : nat64;
          };
        };
      };
      send_whitelist = vec {};
      transfer_fee = opt record {
        e8s = 10_000 : nat64;
      };
      token_symbol = opt \"LICP\";
      token_name = opt \"Local ICP\";
    }
  })
"

log "ICP ledger local setup is complete"
