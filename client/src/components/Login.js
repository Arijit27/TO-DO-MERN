import React, { useState } from 'react';
import axios from 'axios';
import './styles.css';

function Login({ setToken, toggleView }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:5000/login', { username, password })
            .then(response => {
                localStorage.setItem('token', response.data.token);
                setToken(response.data.token , username); // Notify App.js of successful login
            })
            .catch(error => setError('Invalid credentials'));
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
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
                <button className="btn" type="submit">Login</button>
            </form>
            <p className="para">Don't have an account? <button className="tog" onClick={toggleView}>Register</button></p>
        </div>
    );
}

export default Login;

