// src/pages/AllUsersPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Navbar from "../components/Navbar"; // Import the Navbar component

const AllUsersPage = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([])

    const getAllUsers = () => {
        fetch(`${process.env.REACT_APP_API_URL}/latestusers`, {
            method: 'GET',
        })
            .then((res) => res.json())
            .then((data) => {
                setUsers(data.users)
            })
    }
    
    const handleSearch = (searchQuery) => {
        if (!searchQuery.trim()) {
            getAllUsers();
            return;
        }

        fetch(`${process.env.REACT_APP_API_URL}/searchuser?query=${searchQuery}`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.users) {
                    setUsers(data.users);
                } else {
                    setUsers([]);
                }
            })
            .catch((err) => console.error("Error searching users:", err));
    };

    useEffect(() => {
        getAllUsers()
    }, [])

    const handleViewUser = (id) => {
        navigate(`/user/${id}`);
    };

    const handleSearchInputChange = (e) => {
        const query = e.target.value;
        setSearch(query);
        handleSearch(query);
    };

    return (
        <PageContainer>
            {/* Use Navbar here */}
            <Navbar active={'user'}/>

            {/* Content */}
            <Content>
                <h1>All Users Details</h1>
                <br />

                <SearchBar
                    type="text"
                    placeholder="Search users by name or full id..."
                    value={search}
                    onChange={handleSearchInputChange}
                />
                <Table>
                    <thead>
                        <tr>
                            <Th>ID</Th>
                            <Th>Name</Th>
                            <Th>Email</Th>
                            <Th>Phone</Th>
                            <Th>Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <Td>{user._id}</Td>
                                <Td>{user.name}</Td>
                                <Td>{user.email}</Td>
                                <Td>{user.phone || "N/A"}</Td>
                                <Td>
                                    <ViewButton onClick={() => handleViewUser(user._id)}>
                                        View User
                                    </ViewButton>
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Content>
        </PageContainer>
    );
};

export default AllUsersPage;

// Styled Components
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Content = styled.div`
  padding: 20px;
  flex: 1;
  overflow-y: auto;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const Th = styled.th`
  text-align: left;
  padding: 10px;
  border-bottom: 1px solid #ddd;
`;

const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ddd;
`;

const ViewButton = styled.button`
  padding: 5px 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #218838;
  }
`;
