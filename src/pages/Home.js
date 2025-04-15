import React from "react";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom"; // Import Link for routing
import "../styles/Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <img src={logo} alt="Educate Bharat Logo" className="home-logo" />
        <nav className="home-nav">
          <ul>
            <li>
              <Link to="/admin">Go To Admin Page</Link> {/* Use Link instead of <a> */}
            </li>
          </ul>
        </nav>
      </header>
      <main className="home-main">
        <h1>Welcome to Educate Bharat Admin Panel</h1>
        <p>
          Empowering education for everyone. Explore our platform to discover
          resources, join communities, and enhance your learning journey.
        </p>
      </main>
      <footer className="home-footer">
        <p>&copy; 2024 Educate Bharat. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
