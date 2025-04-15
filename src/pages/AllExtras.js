import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { toast } from "react-hot-toast";
import { MoonLoader } from "react-spinners"; // Import spinner
import Navbar from "../components/Navbar"; // Assuming you have a Navbar component

const AllExtras = () => {
    const [extras, setExtras] = useState({
        allCoursesDiscount: 0,
        allProductsDiscount: 0,
        deliveryCharges: 0
    });
    const [isLoading, setIsLoading] = useState(false);

    // Save or Update Extras
    const saveExtras = async () => {
        setIsLoading(true);

        const response = await fetch(`${process.env.REACT_APP_API_URL}/addOrUpdateExtras`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(extras),
        });

        const data = await response.json();
        if (data.error) {
            toast.error(data.error);
        } else {
            toast.success("Extras updated successfully");
        }

        setIsLoading(false);
    };

    // Get Extras
    const getExtras = async () => {
        setIsLoading(true);

        const response = await fetch(`${process.env.REACT_APP_API_URL}/getExtras`);
        const data = await response.json();
        if (data.error) {
            toast.error(data.error);
        } else {
            // console.log(data)
            setExtras(data.extras);
        }

        setIsLoading(false);
    };

    // Fetch extras on mount
    useEffect(() => {
        getExtras();
    }, []);

    return (
        <PageContainer>
            <Navbar active={'extras'}/>
            {
                isLoading ?
                    <div style={loadingStyle}>
                        <MoonLoader size={50} color="#007bff" />
                    </div>
                    :
                    <Content>
                        <Header>
                            <Title>Extras Management</Title>
                            <Button onClick={saveExtras}>Save Extras</Button>
                        </Header>

                        <FormContainer>
                            <FormItem>
                                <Label htmlFor="allCoursesDiscount">Courses Discount %</Label>
                                <Input
                                    type="number"
                                    id="allCoursesDiscount"
                                    value={extras.allCoursesDiscount}
                                    onChange={(e) => setExtras({ ...extras, allCoursesDiscount: e.target.value })}
                                />
                            </FormItem>

                            <FormItem>
                                <Label htmlFor="allProductsDiscount">Products Discount %</Label>
                                <Input
                                    type="number"
                                    id="allProductsDiscount"
                                    value={extras.allProductsDiscount}
                                    onChange={(e) => setExtras({ ...extras, allProductsDiscount: e.target.value })}
                                />
                            </FormItem>

                            <FormItem>
                                <Label htmlFor="deliveryCharges">Delivery Charges ( not in % )</Label>
                                <Input
                                    type="number"
                                    id="deliveryCharges"
                                    value={extras.deliveryCharges}
                                    onChange={(e) => setExtras({ ...extras, deliveryCharges: e.target.value })}
                                />
                            </FormItem>
                        </FormContainer>
                    </Content>
            }
        </PageContainer>
    );
};

export default AllExtras;

// Styled Components

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
`;

const loadingStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
};

const Content = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 30px;
    flex: 1;
    padding: 20px;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const Title = styled.h1`
    font-size: 24px;
    color: #333;
`;

const Button = styled.button`
    background-color: #007bff;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background-color: #0056b3;
    }
`;

const FormContainer = styled.div`
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const FormItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
`;

const Label = styled.label`
    font-size: 16px;
    color: #333;
`;

const Input = styled.input`
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    width: 100%;
`;

