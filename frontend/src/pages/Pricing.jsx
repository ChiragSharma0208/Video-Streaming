import React from "react";
import "./Pricing.css";

const Pricing = () => {
  return (
    <div className="pricing-container">
      <h1>Pricing</h1>
      <p>
        Experience seamless streaming, interactive chat, and community features
        designed for all your entertainment needs.
      </p>
      <div className="plans">
        <div className="plan">
          <h2>Free</h2>
          <p className="price">$0</p>
          <p className="description">
            Perfect for casual users who want to explore our streaming platform
            with basic features.
          </p>
          <ul>
            <li>Access to limited content</li>
            <li>Basic chat features</li>
            <li>Chat stored fot 1 month</li>
            <li>Ad-supported</li>
          </ul>
          <button className="buttonp">Get Started</button>
        </div>
        <div className="plan">
          <h2>Basic</h2>
          <p className="price">$9.99</p>
          <p className="description">
            Ideal for regular users who want enhanced streaming quality and chat
            functionality.
          </p>
          <ul>
            <li>Access to full content library</li>
            <li>Advanced chat features</li>
            <li>Chat stored for 6 months</li>
            <li>Ad-free experience</li>
          </ul>
          <button className="buttonp">Get Started</button>
        </div>
        <div className="plan">
          <h2>Premium</h2>
          <p className="price">$19.99</p>
          <p className="description">
            For power users who want the ultimate streaming experience with
            exclusive features.
          </p>
          <ul>
            <li>Access to exclusive content</li>
            <li>Chat stored for 12 months</li>
            <li>Offline viewing</li>
            <li>Access to beta features</li>
          </ul>
          <button className="buttonp">Start Free Trial</button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
