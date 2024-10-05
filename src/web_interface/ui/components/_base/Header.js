import React from "react";

const Header = () => {
  return (
    <>
      <header>
          <h1 className="text-xl font-semibold py-3">Гласувайте за заглавие</h1>
      </header>

      <nav>
          <a href="#home">Начало</a>
          <a href="#members">Членове</a>
          <a href="#proposals">Предложения</a>
          <a href="#treasury">Хазна</a>
      </nav>
    </>
  )
};

export default Header;