import Head from 'next/head';
import Layout from '../ui/components/_base/Layout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import QRCode from 'react-qr-code';
import { useGeneralContext } from '../contexts/GeneralContent';
import { createAgent } from '@dfinity/utils';
import { LedgerCanister } from '@dfinity/ledger-icp';
import { IcrcLedgerCanister } from '@dfinity/ledger-icrc';

export default function Wallet() {
  const { isAuthenticated, user, identity } = useAuth();
  const { copyToClipboard, formatWithDecimals } = useGeneralContext();
  const router = useRouter();
  const [icpBalance, setIcpBalance] = useState(null);
  const [icpMetadataObj, setIcpMetadataObj] = useState(null);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/');  // Redirect to the homepage if not authenticated
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && identity && user) {
      async function initIcpLedger() {
        const agent = await createAgent({
          identity,
          host: process.env.DFX_NETWORK === 'ic' ? null : "http://127.0.0.1:4943",
          fetchRootKey: process.env.DFX_NETWORK !== 'ic',
        });
  
        const ledgerCanister = LedgerCanister.create({
          agent,
          canisterId: process.env.NEXT_PUBLIC_ICP_LEDGER_CANISTER_ID,
        });
  
        const metadata = await ledgerCanister.metadata({});
  
        // Convert metadata array into an object for easy access
        const metadataObj = metadata.reduce((acc, [key, value]) => {
          acc[key] = value.Text || value.Nat;
          return acc;
        }, {});
        setIcpMetadataObj(metadataObj);
  
        const accountBalance = await ledgerCanister.accountBalance({
          accountIdentifier: user.account,
        });

        setIcpBalance(accountBalance);
      }
  
      initIcpLedger();
    }
  }, [isAuthenticated, identity, user]);

  return (
    <>
      <Head>
        {/* Add relevant meta tags here */}
      </Head>
      <Layout>
        <h1 className="text-3xl font-bold mb-8 text-center">Портфейл</h1>
        {user && (
          <div>
            <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
              {/* Principal Wrap */}
              <div id="principal-wrap" className="flex-1 w-full md:w-1/2 bg-white shadow-lg rounded-lg p-6 border border-gray-200">
                <div className="flex justify-center mb-4">
                  <QRCode value={user.principal.toText()} size={128} />
                </div>
                <p className="text-center text-gray-600">
                  Principal ID:<br />
                  <span className="text-black font-semibold no-spaces">{user.principal.toText()}</span>
                </p>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => copyToClipboard(user.principal.toText())}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                  >
                    {`Копирай Principal`}
                  </button>
                </div>
              </div>
            
              {/* Account Wrap */}
              <div id="account-wrap" className="flex-1 w-full md:w-1/2 bg-white shadow-lg rounded-lg p-6 border border-gray-200">
                <div className="flex justify-center mb-4">
                  <QRCode value={user.account?.toHex()} size={128} />
                </div>
                <p className="text-center text-gray-600">
                  Account ID:<br />
                  <span className="text-black font-semibold no-spaces">{user.account?.toHex()}</span>
                </p>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => copyToClipboard(user.account?.toHex())}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                  >
                    {`Копирай Account`}
                  </button>
                </div>
              </div>
            </div>  
            {/* Tokens Wrap */}
            <div className="tokens-wrap flex flex-wrap mt-6 justify-center md:space-x-6">
              {icpMetadataObj && (
                <div className='bg-white shadow-lg rounded-lg p-6 border border-gray-200 w-full lg:w-1/2 xl:w-1/4'>
                  <div className='flex items-center'>
                    <img src="/logos/icp-logo.png" className="w-10 h-10 mr-2 border rounded-full inline-block" />
                    <div className='inline-block'>
                      <span className='leading-1'>{icpMetadataObj['icrc1:symbol']}</span>
                      <span className='block text-sm leading-none opacity-90'>{icpMetadataObj['icrc1:name']}</span>
                    </div>
                    <div className='ml-auto text-right text-sm font-semibold'>
                      Изпрати<br />
                      Получи
                    </div>
                  </div>
                  <div className='mt-6 text-sm'>
                    Баланс:<br />
                    {icpBalance !== null ? formatWithDecimals(icpBalance, icpMetadataObj['icrc1:decimals']) : (
                      <span className='blur-effect h-5 inline-block w-32'></span>
                    )}
                  </div>
                </div>
              )}
            </div>   
          </div>   
        )}
      </Layout>
    </>
  );
}
