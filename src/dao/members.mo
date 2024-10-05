import Types "types";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";

actor Members {
  let members : Types.Members = HashMap.HashMap<Principal, Types.Account>(10, Principal.equal, Principal.hash);
}
