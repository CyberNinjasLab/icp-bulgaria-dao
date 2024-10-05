import Head from 'next/head';
import Layout from '../ui/components/_base/Layout';
import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import useProposals from '../ui/hooks/useProposals';
import { useAuth } from '../contexts/AuthContext';
import { useGeneralContext } from '../contexts/GeneralContent';
import Proposal from '../ui/components/Proposal';

export default function Home() {
  const { formatTimestampToReadableDate } = useGeneralContext();
  const { openLoginModal, closeLoginModal, isAuthenticated, logout, user } = useAuth();
  const { proposals, fetchProposals, loading, error, hasMore, isReady } = useProposals();
  const [page, setPage] = useState(0); // Track the current page for pagination
  const pageSize = 10; // Number of proposals per request

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      closeLoginModal();
    }
  }, [isAuthenticated]);

  // Fetch proposals on component load if authenticated and ready
  useEffect(() => {
    if (isAuthenticated && isReady) {
      fetchProposals(0, pageSize); // Fetch the first 10 proposals
      console.log(proposals);
    }
  }, [isAuthenticated, isReady]);

  const loadMoreProposals = () => {
    fetchProposals((page + 1) * pageSize, pageSize); // Fetch the next page
    setPage(page + 1); // Increment the page number
  };

  return (
    <>
      <Head>
        {/* Add relevant meta tags here */}
      </Head>
      <Layout>
        {isAuthenticated && (
          <div className="flex flex-col gap-y-4 pb-20">
            <hr />
            {/* Account Data */}
            <div>
              <span className="font-semibold block">Публичен Идентификатор:</span>
              {user ? (
                <>{user.principal.toText()}</>
              ) : (
                <div className="block w-full bg-gray-200/40 rounded animate-pulse">
                  &#8203;
                </div>
              )}
            </div>
            {/* Logout */}
            <div>
              <Button variant="outlined" onClick={logout}>
                Изход
              </Button>
            </div>
            <hr />
            {/* Proposals */}
            <div>
              <span className="font-semibold block">Предложения:</span>
              <div>
                {proposals.length === 0 && !loading && (
                  <p>Няма налични предложения.</p>
                )}
                {proposals.map((proposal, index) => (
                  <Proposal
                    key={index}
                    proposal={proposal}
                    formatTimestampToReadableDate={formatTimestampToReadableDate}
                  />
                ))}
                {loading && <p>Зареждане...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {hasMore && !loading && (
                  <Button variant="contained" onClick={loadMoreProposals}>
                    Покажи още
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}
