import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const useProposals = () => {
  const { proposalsActor } = useAuth(); // Get the proposalsActor from useAuth
  const [proposals, setProposals] = useState([]); // State to store fetched proposals
  const [loading, setLoading] = useState(false);  // Loading state
  const [error, setError] = useState(null);       // Error state
  const [hasMore, setHasMore] = useState(true);   // Check if more proposals can be fetched
  const [isReady, setIsReady] = useState(false);  // State to track when proposalsActor is ready

  useEffect(() => {
    if (proposalsActor) {
      setIsReady(true); // Mark as ready when proposalsActor is set
    }
  }, [proposalsActor]);

  const fetchProposals = useCallback(async (start, length) => {
    if (!isReady) return; // Wait for proposalsActor to be ready
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await proposalsActor.getProposals(start, length);
      if(result.ok) {
        if (result.ok.length < length) {
          setHasMore(false);
        }
        setProposals(result.ok);
      } else {
        setError("An error occurred while loading proposals.");
      }
    } catch (err) {
      setError('Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  }, [proposalsActor, isReady]);

  // Function to vote on a proposal
  const voteProposal = async (proposalId, choiceId) => {
    try {
      const result = await proposalsActor.voteProposal(proposalId, choiceId);
      return result;
    } catch (err) {
      console.error('Error voting on proposal:', err);
      return { ok: false };
    }
  };

  // Function to get voter records for a proposal
  const getVoterRecordsForProposal = async (proposalId) => {
    try {
      const result = await proposalsActor.getVoterRecordsForProposal(proposalId);
      return result.ok ? result.ok : [];
    } catch (err) {
      console.error('Error fetching voter records:', err);
      return [];
    }
  };

  const resetProposals = () => {
    setProposals([]);
    setHasMore(true);
  };

  return { 
    proposals, 
    fetchProposals, 
    loading, 
    error, 
    hasMore, 
    resetProposals, 
    voteProposal, 
    getVoterRecordsForProposal, 
    isReady 
  };
};

export default useProposals;
