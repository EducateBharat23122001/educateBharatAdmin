// dispatch(login()); // Dispatch login action
// navigate("/admin");

import React from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast'


import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
const Login = () => {
  const [email, setEmail] = useState('')
  const [otpsent, setOtpSent] = useState(false)
  const [otp, setotp] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  // const [password, setPassword] = useState('')

  const handleLogin = async () => {
    if (email == '' || otp == '') {
      toast.error('Please fill all the fields')
      window.location.reload()
      return
    }
    fetch(process.env.REACT_APP_API_URL + '/adminLogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email, otp
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message == "Invalid Admin OTP" || data.message == "Invalid Admin Email") {
          toast.error('Invalid Admin OTP')
        } else {
          localStorage.setItem('token', data.token)
          dispatch(login()); // Dispatch login action
          navigate("/admin");
        }
      })
      .catch(err => {
        console.log(err)
        toast.error('Something went wrong')
      })
  }


  const SendOtp = async () => {
    setLoading(true);

    fetch(process.env.REACT_APP_API_URL + '/sendotptoadmin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok == false) {
          toast.error(data.message)
        } else {
          toast.success('OTP sent to your email')
          setOtpSent(true)
          // window.location.href = '/verifyotp'
        }
      })
      .catch(err => {
        toast.error('Something went wrong')
      })
      .finally(() => {
        setLoading(false);
      })
  }
  return (
    <div style={{
      position: 'fixed',
      width: '100%',
      height: '100%',
      backgroundColor: 'black',
    }}>
      {
        otpsent == false ?
          <Container>
            <Form>
              <Title>Admin Login</Title>
              <Input type="text" placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {/* <Input type="password" placeholder="Password"
                     onChange={(e) => setPassword(e.target.value)}
                 /> */}
              {
                !loading ?
                  <Button
                    onClick={SendOtp}
                  >SendOtp</Button>
                  :
                  <Button
                  >Please Wait...</Button>
              }
            </Form>
          </Container>
          :
          <Container>
            <Form>
              <Title>Admin Login</Title>
              <Input type="text" placeholder="Otp"
                value={otp}
                onChange={(e) => setotp(e.target.value)}
              />
              {/* <Input type="password" placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                        /> */}
              <Button
                onClick={handleLogin}
              >Login</Button>
            </Form>
          </Container>
      }
    </div>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Form = styled.div`
  background-color: #f5f5f5;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 400px;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: none;
  border-radius: 4px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const Link = styled.a`
  display: block;
  text-align: center;
  margin-top: 10px;
  color: #007bff;
  text-decoration: none;
`;

export default Login;
