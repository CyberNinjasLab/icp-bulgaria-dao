import Result "mo:base/Result";
import Nat "mo:base/Nat";
import TrieMap "mo:base/TrieMap";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Buffer "mo:base/Buffer";
import Array "mo:base/Array";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Types "types";
import Time "mo:base/Time";
import Helper "helper";

actor Proposals {
  public type Result<Ok, Err> = Result.Result<Ok, Err>;
  
  // Define stable variables to persist data across canister upgrades
  stable var proposalsRepository : [(Nat, Types.Proposal)] = [];

  stable var sortedIdsRepository : [Nat] = []; // To store sorted IDs from newest to oldest
  stable var openProposalIdsRepository : [Nat] = []; // To store sorted IDs from newest to oldest (OPEN PROPOSALS)
  stable var voterRecordsRepository : [((Principal, Nat), [Nat])] = [];
  
  stable var nextProposalId : Nat = 1;
  stable var nextSurveyChoiceId : Nat = 0;

  let PAGINATION_MAX_LENGTH = 100;
  let DAYS_TO_EXPIRE = 7;
  let NANOSECONDS_IN_DAY = 24 * 60 * 60 * 1_000_000_000;  // 1 day in nanoseconds

  let sortedIds = Buffer.fromArray<Nat>(sortedIdsRepository);
  let openProposalIds = Buffer.fromArray<Nat>(openProposalIdsRepository);

  let proposals : Types.Proposals = TrieMap.fromEntries<Nat, Types.Proposal>(
    proposalsRepository.vals(), Nat.equal, Hash.hash
  );

  let voterRecords : HashMap.HashMap<(Principal, Nat), [Types.Id]> = HashMap.HashMap<(Principal, Nat), [Types.Id]>(10, Helper.principalNatEqual, Helper.principalNatHash);

  public shared ({ caller }) func addProposal(proposalData: Types.ProposalRequest) : async Result<Types.Proposal, Text> {
    let category : Types.ProposalCategory = switch(proposalData.category) {
      case(#Survey {surveyMode; votersCanAddChoices; choices}) {
        #Survey {
          surveyMode = surveyMode;
          votersCanAddChoices = votersCanAddChoices;
          choices = Array.map<Text, (Types.Id, Text, Types.Votes)>(choices, func(choice) {
            nextSurveyChoiceId += 1;
            return (nextSurveyChoiceId, choice, 0);
          });
        }
      };
    };

    let now = Time.now();

    let proposal : Types.Proposal = {
      createdBy = caller;
      createdAt = now;
      expiresAt = now + (NANOSECONDS_IN_DAY * DAYS_TO_EXPIRE);
      proposalId = nextProposalId;
      proposalTitle = proposalData.proposalTitle;
      category = category;
      requiredRole = proposalData.requiredRole;
      status = #Open;
    };

    proposals.put(nextProposalId, proposal);

    // Insert at the beginning of the array to maintain sorted order (newest to oldest)
    sortedIds.insert(0, nextProposalId);
    openProposalIds.insert(0, nextProposalId);

    nextProposalId += 1;

    return #ok(proposal);
  };

  public query func getProposals(start: Nat, length: Nat) : async Result<[Types.Proposal], Text> {
    let totalProposals = sortedIds.size();
    
    if (start >= totalProposals) {
      return #ok([]);
    };

    if (length > PAGINATION_MAX_LENGTH) {
      return #err("Requested length exceeds the maximum allowed pagination limit.");
    };

    let endIndex = Nat.min(start + length, totalProposals);

    // Check to avoid negative subtraction
    if (endIndex <= start) {
        return #ok([]); // Return empty if there's nothing to fetch
    };

    let result = Buffer.toArray<Nat>(sortedIds);
    let pageIds = Array.subArray(result, start, endIndex - start);  // Get a slice of IDs
    
    // Fetch proposals by their IDs
    return #ok(Array.map<Nat, Types.Proposal>(pageIds, func (id) {
      switch (proposals.get(id)) {
        case (?proposal) { proposal };  // Return the proposal if found
        case null { Debug.trap("Proposal not found, this should not happen"); };
      }
    }));
  };

  public query func getProposal(index : Nat) : async Result<Types.Proposal, Text> {
    let result = proposals.get(index);

    switch(result) {
      case(null) {
        return #err("Proposal with the specified ID not found.");
      };
      case(?proposal) {
        return #ok(proposal);
      };
    };
  };

  public shared ({ caller }) func voteProposal(proposalId: Nat, choiceId: Types.Id) : async Result<Text, Text> {
    // Get the proposal
    switch (proposals.get(proposalId)) {
      case(null) {
        return #err("Proposal not found.");
      };
      case(?proposal) {
        // Check if the proposal is open
        if (proposal.status != #Open) {
          return #err("Voting is not allowed, the proposal is closed.");
        };

        // Check if the proposal is expired
        if (Time.now() > proposal.expiresAt) {
          return #err("Voting is not allowed, the proposal has expired.");
        };

        // Ensure the proposal is a survey type
        switch (proposal.category) {
          case (#Survey {choices; votersCanAddChoices; surveyMode}) {
            
            // Fetch the existing voted choices (if any) for the caller and proposal
            let existingVotes = switch (voterRecords.get((caller, proposalId))) {
              case (?voterChoices) { voterChoices };
              case null { [] };
            };

            // Check if the voter has already voted for this choice
            switch (surveyMode) {
              case (#Checkbox) {
                // Check if the choiceId is already in the existing votes
                let alreadyVoted = Array.filter<Nat>(existingVotes, func(votedChoiceId) {
                  return votedChoiceId == choiceId;
                });

                if (Array.size(alreadyVoted) > 0) {
                  return #err("You have already voted for this choice on this proposal.");
                };
              };
              case (#Radio) {
                // For Radio mode, voter can vote only once
                if (Array.size(existingVotes) > 0) {
                  return #err("You have already voted on this proposal (radio mode).");
                };
              };
            };

            // Check if the choiceId exists in the list of choices
            let filteredChoices = Array.filter<(Types.Id, Text, Types.Votes)>(choices, func(choice) {
              let (id, _, _) = choice;
              return id == choiceId;
            });

            if (Array.size(filteredChoices) == 0) {
              return #err("Invalid choice ID.");
            };

            // Find the choice by the provided choiceId and update the votes
            let updatedChoices = Array.map<(Types.Id, Text, Types.Votes), (Types.Id, Text, Types.Votes)>(choices, func (choice) {
              let (id, choiceText, votes) = choice;
              if (id == choiceId) {
                return (id, choiceText, votes + 1);  // Increment votes for the selected choice
              } else {
                return choice;
              }
            });

            // Update the proposal with the new choice votes
            let updatedProposal: Types.Proposal = {
              proposalId = proposal.proposalId;
              createdBy = proposal.createdBy;
              createdAt = proposal.createdAt;
              expiresAt = proposal.expiresAt;
              proposalTitle = proposal.proposalTitle;
              category = #Survey {
                surveyMode = surveyMode;
                votersCanAddChoices = votersCanAddChoices;
                choices = updatedChoices;
              };
              requiredRole = proposal.requiredRole;
              status = proposal.status;
            };

            proposals.put(proposalId, updatedProposal);  // Save the updated proposal

            // Merge the new choiceId with existing votes and update the voterRecords
            let updatedVotes = Array.append<Nat>(existingVotes, [choiceId]);
            voterRecords.put((caller, proposalId), updatedVotes);  // Store merged votes

            return #ok("Vote cast successfully.");
          };
          case (_) {
            return #err("Voting is only allowed on survey proposals.");
          };
        }
      };
    }
  };

  public shared query ({ caller }) func getVoterRecordsForProposal(index : Nat) : async Result<?[Types.Id], Text> {
    let result = voterRecords.get((caller, index));

    switch(result) {
      case(null) {
        return #ok(null);
      };
      case(?list) {
        return #ok(?list);
      };
    }
  };

  public shared query (msg) func whoami() : async Principal {
    msg.caller
  };

  // Actions before upgrade the canister
  system func preupgrade() {
    proposalsRepository := Iter.toArray(proposals.entries());
    sortedIdsRepository := Buffer.toArray<Nat>(sortedIds);
    openProposalIdsRepository := Buffer.toArray<Nat>(openProposalIds);
    voterRecordsRepository := Iter.toArray(voterRecords.entries());
  };

  system func postupgrade() {
    for ((key: (Principal, Nat), value: [Nat]) in voterRecordsRepository.vals()) {
      voterRecords.put(key, value);
    };

    proposalsRepository := [];
    sortedIdsRepository := [];
    openProposalIdsRepository := [];
  };
}
