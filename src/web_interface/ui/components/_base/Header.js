import React from "react";
import Link from "next/link";
import { Button, IconButton } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"; // Import the wallet icon
import { useAuth } from "../../../contexts/AuthContext";

const Header = () => {
  const { isAuthenticated, logout} = useAuth();

  return (
    <>
      <header>
        <h1 className="text-xl font-semibold py-3">Гласувайте за заглавие</h1>
      </header>

      <nav className="flex justify-center items-center relative">
        <div id="main-nav" className="flex space-x-4">
          <a href="/">Начало</a>
          <a href="#members">Членове</a>
          <a href="#proposals">Предложения</a>
          <a href="#treasury">Хазна</a>
        </div>

        { isAuthenticated && (
          <div className="ml-auto absolute right-5">
            {/* Add Link to wallet with MUI Icon */}
            <Link href="/wallet" passHref className="rounded-full bg-white/90 inline-block mr-2 scale-90">
              <IconButton
                color="primary"
                aria-label="wallet"
              >
                <AccountBalanceWalletIcon />
              </IconButton>
            </Link>
            <Button variant="contained" onClick={logout}>
              Изход
            </Button>
          </div>
        )}
      </nav>
    </>
  );
};

export default Header;
