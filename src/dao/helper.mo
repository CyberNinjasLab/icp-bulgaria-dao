import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Principal "mo:base/Principal";

module Helper {
  // Function to compare two (Principal, Nat) tuples for equality
  public func principalNatEqual(key1: (Principal, Nat), key2: (Principal, Nat)) : Bool {
    return key1.0 == key2.0 and key1.1 == key2.1;
  };

  // Function to hash a (Principal, Nat) tuple
  public func principalNatHash((principal, n): (Principal, Nat)): Hash.Hash {
    // Hash the Principal as text
    let principalHash = Principal.hash(principal);
    
    // Hash the Nat
    let natHash = Hash.hash(n);
    
    // Combine the two hashes using a robust mix with modular arithmetic
    let combinedHash = principalHash ^ (natHash +% 0x9e3779b9 +% (principalHash << 6) +% (principalHash >> 2));

    // Return the combined hash
    combinedHash
  };
};
