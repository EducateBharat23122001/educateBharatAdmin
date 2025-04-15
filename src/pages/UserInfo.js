import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import { ClipLoader } from 'react-spinners';
const UserDetails = () => {
    const { id } = useParams(); // Extract the user ID from the URL
    const navigate = useNavigate(); // Hook for navigation
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to fetch user data using the provided function
    const getuserdata = async (userid) => {
        const token = await localStorage.getItem("token");
        console.log(userid, token);
        fetch(`${process.env.REACT_APP_API_URL}/getUserDataforAdmin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userid }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.message === "success") {
                    console.log(data);
                    setUser(data.user);
                    setLoading(false);
                } else {
                    toast.error("Error in fetching data");
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error("Error fetching user details:", err);
                toast.error("Error in fetching data");
                setLoading(false);
            });
    };

    useEffect(() => {
        getuserdata(id); // Call the function with the user ID from params
    }, [id]);

    if (loading) {
        return (
            <LoadingContainer>
                <ClipLoader size={50} color={"#007bff"} loading={loading} />
            </LoadingContainer>
        );
    }
    if (!user) {
        return <ErrorMessage>User not found.</ErrorMessage>;
    }

    return (
        <UserContainer>
            <BackButton onClick={() => navigate(-1)}>← Back</BackButton>
            <h1>User Details</h1>
            <Table>
                <tbody>
                    <TableRow>
                        <TableCell><strong>ID:</strong></TableCell>
                        <TableCell>{user._id}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell><strong>Name:</strong></TableCell>
                        <TableCell>{user.name}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell><strong>Email:</strong></TableCell>
                        <TableCell>{user.email}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell><strong>Phone:</strong></TableCell>
                        <TableCell>{user.phone || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell><strong>Age:</strong></TableCell>
                        <TableCell>{user.age || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell><strong>Address:</strong></TableCell>
                        <TableCell>
                            {user.address?.AddressLine1 || "N/A"} <br />
                            {user.address?.AddressLine2 || ""}<br />
                            {user.address?.City || ""}, {user.address?.State || ""} - {user.address?.Pincode || ""}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell><strong>Courses Purchased:</strong></TableCell>
                        <TableCell>
                            {user.coursePurchased?.length > 0 ? (
                                <ul>
                                    {user.coursePurchased.map((course, index) => (
                                        <li key={index}>{course}</li>
                                    ))}
                                </ul>
                            ) : (
                                "None"
                            )}
                        </TableCell>
                    </TableRow>
                </tbody>
            </Table>
        </UserContainer>
    );
};

export default UserDetails;

// Styled Components
const UserContainer = styled.div`
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;
const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
`;
const BackButton = styled.button`
    margin-bottom: 20px;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background-color: #0056b3;
    }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableRow = styled.tr`
    border-bottom: 1px solid #ddd;

    &:last-child {
        border-bottom: none;
    }
`;

const TableCell = styled.td`
    padding: 10px;
    vertical-align: top;
    &:first-child {
        font-weight: bold;
        width: 30%;
    }
`;

const Loading = styled.div`
    text-align: center;
    margin-top: 50px;
`;

const ErrorMessage = styled.div`
    text-align: center;
    color: red;
    margin-top: 50px;
`;
