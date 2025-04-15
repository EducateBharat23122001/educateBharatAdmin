// src/pages/AllOrdersPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Navbar from "../components/Navbar"; // Import the Navbar component

const AllOrdersPage = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [orders, setOrders] = useState([]);

    const getOldestUndeliveredOrders = () => {
        fetch(`${process.env.REACT_APP_API_URL}/getUndeliveredOrdersAdmin`, {
            method: 'GET',
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setOrders(data.orders); // Store the fetched orders
            })
            .catch((err) => console.error("Error fetching undelivered orders:", err));
    }

    const handleSearch = (searchQuery) => {
        if (!searchQuery.trim()) {
            getOldestUndeliveredOrders(); // Fetch undelivered orders if search is cleared
            return;
        }

        // Check if search query is a valid order ID or customer ID
        const isId = searchQuery.length === 24; // MongoDB ObjectId length

        let url = `${process.env.REACT_APP_API_URL}/searchOrders?`;

        if (isId) {
            url += `id=${searchQuery}`;
        } else {
            url += `query=${searchQuery}`;  // For general search query
        }

        fetch(url, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.orders) {
                    console.log(data.orders);
                    setOrders(data.orders);
                } else {
                    setOrders([]);
                }
            })
            .catch((err) => console.error("Error searching orders:", err));
    };


    useEffect(() => {
        getOldestUndeliveredOrders(); // Fetch undelivered orders on page load
    }, []);

    const handleViewOrder = (id) => {
        navigate(`/order/${id}`);
    };

    const handleSearchInputChange = (e) => {
        const query = e.target.value;
        setSearch(query);
        handleSearch(query);
    };

    return (
        <PageContainer>
            {/* Use Navbar here */}
            <Navbar active={'orders'} />

            {/* Content */}
            <Content>
                <h1>Undelivered Orders</h1>
                <br />

                <SearchBar
                    type="text"
                    placeholder="Search orders by order ID..."
                    value={search}
                    onChange={handleSearchInputChange}
                />
                <Table>
                    <thead>
                        <tr>
                            <Th>Order ID</Th>
                            <Th>Customer</Th>
                            <Th>Status</Th>
                            <Th>Amount</Th>
                            <Th>Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders
                            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Sorting by 'createdAt' in ascending order (oldest first)
                            .map((order) => (
                                <tr key={order._id}>
                                    <Td>{order._id}</Td>
                                    <Td>{order.userId}</Td>
                                    <Td>{order.isDelivered}</Td>
                                    <Td>{order.carttotal}</Td>
                                    <Td>
                                        <ViewButton onClick={() => handleViewOrder(order._id)}>
                                            View Order
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

export default AllOrdersPage;

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
