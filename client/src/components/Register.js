import React, { useState } from "react";
import axios from "axios";
import "./styles.css";

function Register({ toggleView }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/register", { username, password })
      .then((response) => {
        // Optionally auto-login the user or redirect to login page
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          toggleView();
        }, 1000); // 1 seconds
        //toggleView(); // Switch to login view after registration
      })
      .catch((error) => setError("Registration failed"));
  };

  return (
    <div className="register-container">
      {showAlert && (
        <div className="alert alert-success">Registration successful!</div>
      )}
      <h2>Register</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn" type="submit">
          Register
        </button>
      </form>
      <p className="para">
        Already have an account?{" "}
        <button className="tog" onClick={toggleView}>
          Login
        </button>
      </p>
    </div>
  );
}

export default Register;
