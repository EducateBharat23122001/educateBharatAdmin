import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Navbar from "../components/Navbar"; // Import the Navbar component
import { toast } from 'react-toastify'; // Import toast for error notifications

const AllProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch all products
  const getAllProducts = () => {
    fetch(`${process.env.REACT_APP_API_URL}/getallProducts`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error); // Display error if any
        } else {
          setProducts(data.products); // Set products in state
        }
      })
      .catch((error) => {
        toast.error("Something went wrong!");
      });
  };

  useEffect(() => {
    getAllProducts(); // Fetch products on component mount
  }, []);

  // Handle search for products
  const handleSearchInputChange = (e) => {
    setSearch(e.target.value);
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.productName.toLowerCase().includes(search.toLowerCase()) ||
    product._id.toLowerCase().includes(search.toLowerCase()) // Search by ID
  );

  // Navigate to edit product page
  const handleEditProduct = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <PageContainer>
      <Navbar active={'store'} /> {/* Use Navbar here */}

      <Content>
        <Header>
          <h1>All Products</h1>
          <Button onClick={() => navigate('/addproduct')}>Add Product +</Button>

        </Header>
        <SearchContainer>
          <SearchInput
            type='text'
            placeholder='Search by name or full id'
            value={search}
            onChange={handleSearchInputChange}
          />

        </SearchContainer>
        <Table>
          <thead>
            <tr>
              <Th>Id</Th>
              <Th>Name</Th>
              <Th>Price</Th>
              <Th>Stock</Th>
              <Th>Discount</Th>

              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts
              .slice() // Create a shallow copy to avoid mutating the original array
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by createdAt in descending order
              .map((product) => (
                <tr key={product._id}>
                  <Td>{product._id}</Td>
                  <Td>
                    <ProductName>
                      <ProductImage src={product.productImages[0]} alt="product" />
                      {product.productName}
                    </ProductName>
                  </Td>
                  <Td>{product.productPrice}</Td>
                  <Td>{product.productStock}</Td>
                  <Td>{product.productDiscount}</Td>

                  <Td>
                    <EditButton onClick={() => handleEditProduct(product._id)}>
                      <EditIcon xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </EditIcon>
                    </EditButton>
                  </Td>
                </tr>
              ))}
          </tbody>
        </Table>
      </Content>
    </PageContainer>
  );
};

export default AllProductsPage;

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

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: #000000;
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: #0056b3;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 8px;
  margin-right: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
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

const ProductName = styled.div`
  display: flex;
  align-items: center;
`;

const ProductImage = styled.img`
  width: 40px;
  height: 40px;
  margin-right: 10px;
  border-radius: 4px;
`;

const EditButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  
  &:hover {
    color: #007bff;
  }
`;

const EditIcon = styled.svg`
  width: 24px;
  height: 24px;
  color: #333;
`;
