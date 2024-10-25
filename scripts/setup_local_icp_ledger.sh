#!/bin/bash

# Stop the script if any command fails
set -e

# Define a function to log messages
log() {
  echo "=> $1"
}

# Save the current identity
CURRENT_IDENTITY=$(dfx identity whoami)

# Check if "minter" identity exists, create it if not
if ! dfx identity list | grep -q "minter"; then
  log "Creating 'minter' identity"
  dfx identity new minter
fi

# Switch to "minter" identity
log "Switching to 'minter' identity"
dfx identity use minter
export MINTER_ACCOUNT_ID=$(dfx ledger account-id)

# Check if the first argument is provided
if [ -z "$1" ]; then
  log "No initial wallet argument provided; using current identity's account ID as default"
  INITIAL_BALANCE_WALLET=$(dfx identity use "$CURRENT_IDENTITY" && dfx ledger account-id)
else
  log "Setting initial balance wallet from argument"
  INITIAL_BALANCE_WALLET=$1
fi

# Switch back to 'minter' identity for deployment
dfx identity use minter

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

# Switch back to the original identity
log "Switching back to the original identity: $CURRENT_IDENTITY"
dfx identity use "$CURRENT_IDENTITY"

log "ICP ledger local setup is complete"
