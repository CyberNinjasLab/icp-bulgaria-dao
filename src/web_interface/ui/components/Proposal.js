import { useState, useEffect } from 'react';
import useProposals from '../hooks/useProposals';
import { Button } from '@mui/material';
import { useGeneralContext } from '../../contexts/GeneralContent';

const Proposal = ({ proposal, formatTimestampToReadableDate }) => {
  const { calculateTimeLeft } = useGeneralContext();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(proposal.expiresAt));
  const { voteProposal, getVoterRecordsForProposal } = useProposals();

  // State to store choices with their vote counts
  const [choices, setChoices] = useState(proposal.category.Survey.choices);

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Open':
        return 'Отворено';
      case 'Accepted':
        return 'Прието';
      case 'Rejected':
        return 'Отхвърлено';
      default:
        return 'Неизвестен статус'; // Default in case of an unexpected status
    }
  };

  const handleVote = async (choiceId) => {
    try {
      const result = await voteProposal(proposal.proposalId, choiceId);
      if (result.ok) {
        alert("Гласувахте успешно!");

        // Dynamically update the vote count for the selected choice
        setChoices((prevChoices) =>
          prevChoices.map((choice) =>
            choice[0] === choiceId
              ? [choice[0], choice[1], (BigInt(choice[2]) + BigInt(1))] // Ensure BigInt arithmetic
              : choice
          )
        );
      } else {
        alert(result.err);
      }
    } catch (err) {
      alert("An error occurred while voting.");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(proposal.expiresAt));
    }, 1000 * 60);

    return () => clearInterval(timer); // Cleanup interval on unmount
  }, [proposal.expiresAt]);

  return (
    <div className="p-2 border rounded mb-2 flex">
      <style>{`
        .choice-item {
          position: relative;
          padding: 6px;
        }
        .choice-item:hover {
          background-color: #f0f0f0;
        }
        .vote-button {
          display: none;
          position: absolute;
          top: 0;
          right: 0;
        }
        .choice-item:hover .vote-button {
          display: block;
        }
      `}</style>

      <div className='md:w-1/2 flex flex-col gap-y-3'>
        <p>
          <span className='font-semibold'>Тема:</span> {proposal.proposalTitle}
        </p>
        <p>
          <span className='font-semibold'>Статус:</span> {getStatusLabel(Object.keys(proposal.status)[0])}
        </p>
        <p>
          <span className='font-semibold'>Изтича след:</span> {timeLeft.days > 0 && <span>{timeLeft.days} дни, </span>}
          {timeLeft.hours > 0 && <span>{timeLeft.hours} часа</span>}{timeLeft.days === 0 && <span>, {timeLeft.minutes} минути </span>}
        </p>
        <p>
          <span className='font-semibold block'>Създаден на:</span> {formatTimestampToReadableDate(proposal.createdAt)}
        </p>
        <p>
          <span className='font-semibold block'>Вносител на предложението:</span> 
          {proposal.createdBy.toText()}
        </p>
      </div>
      <div className='md:w-1/2 flex flex-col gap-y-2'>
        <p>
          <span className='font-semibold block'>Избори:</span>
        </p>
        <ul className='list-disc ml-4 flex flex-col gap-y-1'>
          {choices.map((choice) => (
            <li key={choice[0]} className="choice-item">
              <div className='flex items-center'>
                <span>{choice[1]} ({choice[2].toString()})</span>
                <Button
                  onClick={() => handleVote(choice[0])}
                  className="vote-button"
                  variant='contained'
                  sx={{
                    marginTop:0
                  }}
                >
                  Гласувай
                </Button>
              </div>  
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Proposal;
