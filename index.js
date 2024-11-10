import React, { useState } from 'react';
import './LoginBox.css';
import CustomButton from './Common/CustomButton.jsx';
import CustomInput from './Common/CustomInput.jsx';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginBox() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Remove this line since we're not using cookies
    // axios.defaults.withCredentials = true;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3001/login', { 
                email, 
                password 
            });
            
            console.log('Login response:', response);
            
            // Check if token exists in response
            if (response.data.token) {
                // Store token in localStorage
                localStorage.setItem('token', response.data.token);
                
                // Optionally store user data if provided
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                
                navigate('/home');
            } else {
                setError('Login failed: Authentication token not received');
            }
        } catch (err) {
            console.error('Login error:', err);
            
            // Clear any existing tokens on login failure
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            setError(
                err.response?.data?.error || 
                'Invalid credentials or server error'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-box container mt-5">
            <h2 className="text-center">Login</h2>
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <CustomInput 
                    name={"email"} 
                    label={"Email"} 
                    type={"email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                />
                <CustomInput 
                    name={"password"} 
                    label={"Password"} 
                    type={"password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                />
                <CustomButton 
                    label={loading ? "Logging in..." : "Login"}
                    type={"submit"}
                    disabled={loading}
                />
            </form>
            <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
        </div>
    );
};

export default LoginBox;
