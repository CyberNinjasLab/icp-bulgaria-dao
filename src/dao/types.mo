import HashMap "mo:base/HashMap";
import Blob "mo:base/Blob";
import TrieMap "mo:base/TrieMap";
import Time "mo:base/Time";

module {
  public type HashMap<K, V> = HashMap.HashMap<K, V>;
  public type TrieMap<K, V> = TrieMap.TrieMap<K, V>;

  public type AccountRole = {
    #Guest;
    #Member;
  };

  public type Account = { 
    userPrincipal : Principal; 
    roles: [AccountRole];
    name: ?Text;
    avatarData: ?Blob;
    avatarMimeType: ?Text;
  };

  public type Members = HashMap<Principal, Account>;

  public type ProposalStatus = {
    #Open;
    #Accepted;
    #Rejected;
  };

  public type Votes = Nat;
  public type Id = Nat;

  public type ProposalCategory = {
    #Survey: {
      surveyMode: {
        #Radio;
        #Checkbox;
      };
      votersCanAddChoices: Bool;
      choices: [(Id, Text, Votes)];
    };
    // #TokenTransfer: {
    //   // TBA
    // };
    // #DictionaryUpdate: {
    //   // TBA
    // };
  };

  public type ProposalCategoryRequest = {
    #Survey: {
      surveyMode: {
        #Radio;
        #Checkbox;
      };
      votersCanAddChoices: Bool;
      choices: [Text];
    };
  };

  public type Proposal = {
    proposalId: Nat;
    createdBy : Principal;
    createdAt: Time.Time;
    expiresAt: Time.Time;
    proposalTitle: Text;
    category: ProposalCategory;
    requiredRole: AccountRole;
    status: ProposalStatus;
  };

  public type ProposalRequest = {
    proposalTitle: Text;
    category: ProposalCategoryRequest;
    requiredRole: AccountRole;
  };

  public type Proposals = TrieMap<Nat, Proposal>;
}