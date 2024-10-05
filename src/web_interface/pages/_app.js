import '../styles/global.css'; // Tailwind CSS
import Head from 'next/head';
import { AuthProvider } from '../contexts/AuthContext';
import { GeneralProvider } from '../contexts/GeneralContent';

function App({ Component, pageProps }) {
  return (
    <>
      <Head> 
        <meta charset="UTF-8"></meta>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
        <title>ICP Bulgarian Community</title>
      </Head>
      <GeneralProvider>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </GeneralProvider>
    </>
  );
}

export default App;