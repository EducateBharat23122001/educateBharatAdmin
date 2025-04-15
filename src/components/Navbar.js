// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../assets/logo.png';

const Navbar = ({ active }) => {
  return (
    <Nav>
      <Logo src={logo} alt="Logo" />
      <NavLinks>
        <NavLink to="/allcourses" active={active === 'courses'}>COURSES</NavLink>
        <NavLink to="/users" active={active === 'user'}>USERS</NavLink>
        <NavLink to="/allproducts" active={active === 'store'}>STORE</NavLink>
        <NavLink to="/allorders" active={active === 'orders'}>ORDERS</NavLink>
        <NavLink to="/allbanners" active={active === 'banners'}>BANNERS</NavLink>
        <NavLink to="/allextras" active={active === 'extras'}>EXTRAS</NavLink>

      </NavLinks>
    </Nav>
  );
};

export default Navbar;

// Styled Components
const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #000;
  color: white;
`;

const Logo = styled.img`
  height: 40px;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 20px;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: ${({ active }) => (active ? '#fff' : '#d0d7de')};
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};

  &:hover {
    color: #fff;
  }
`;
