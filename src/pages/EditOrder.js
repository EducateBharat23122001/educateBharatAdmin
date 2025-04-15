import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MoonLoader } from 'react-spinners';
const EditOrder = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getOrder();
    }, [id]);

    const getOrder = () => {
        fetch(`${process.env.REACT_APP_API_URL}/getOrderByIdAdmin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId: id }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    toast.error(data.error);
                } else {
                    setOrder(data.order);
                    console.log(data.order);
                }
            });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem('token');

        try {
            fetch(`${process.env.REACT_APP_API_URL}/updateOrderByIdAdmin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,

                },
                body: JSON.stringify({ orderId: id, order }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.message=='success') {
                        toast.success('Order updated successfully');
                        getOrder()
                    } else {
                        toast.error('Failed to update order');
                    }
                })


        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!order) return <Loading>Loading...</Loading>;

    if (isSubmitting) {
        return <Loading>
            <div style={loadingStyle}>
                <p>Uploading File...Please do not refresh</p>
                <MoonLoader size={50} color="#007bff" />
            </div>
        </Loading>;
    }
    return (
        <PageContainer>
            <BackButton onClick={() => navigate(-1)}>← Back</BackButton>
            <Content>
                <h1>Edit Order</h1>
                <Section>
                    <h2>Basic Details</h2>
                    <Table>
                        <tbody>
                            <tr>
                                <Th>Order ID</Th>
                                <Td>
                                    <Input type="text" value={order._id} disabled />
                                </Td>
                            </tr>
                            <tr>
                                <Th>Customer ID</Th>
                                <Td>
                                    <Input type="text" value={order.userId} disabled />
                                </Td>
                            </tr>
                            <tr>
                                <Th>Shipping Address</Th>
                                <Td>
                                    <Textarea value={`${order.shippingAddress.AddressLine1}, ${order.shippingAddress.AddressLine2}, ${order.shippingAddress.City}, ${order.shippingAddress.State} - ${order.shippingAddress.Pincode}`} disabled />
                                </Td>
                            </tr>
                            <tr>
                                <Th>Payment Method</Th>
                                <Td>
                                    <Input type="text" value={order.paymentMethod} disabled />
                                </Td>
                            </tr>
                            <tr>
                                <Th>Payment ID</Th>
                                <Td>
                                    <Input type="text" value={order.paymentId} disabled />
                                </Td>
                            </tr>
                            <tr>
                                <Th>Cart Total</Th>
                                <Td>
                                    <Input type="text" value={order.carttotal} disabled />
                                </Td>
                            </tr>
                            <tr>
                                <Th>Shipping/Delivery Cost</Th>
                                <Td>
                                    <Input type="text" value={order.shippingCost} disabled />
                                </Td>
                            </tr>

                            <tr>
                                <Th>Is Paid</Th>
                                <Td>
                                    <Select
                                        value={order.isPaid}
                                        onChange={(e) =>
                                            setOrder({ ...order, isPaid: e.target.value })
                                        }
                                    >
                                        <Option value={true}>Paid</Option>
                                        <Option value={false}>Not Paid</Option>
                                    </Select>
                                </Td>
                            </tr>

                            <tr>
                                <Th>Is Delivered</Th>
                                <Td>
                                    <Select
                                        value={order.isDelivered}
                                        onChange={(e) =>
                                            setOrder({ ...order, isDelivered: e.target.value })
                                        }
                                    >
                                        <Option value={'Delivered'}>Delivered</Option>
                                        <Option value={'Not Delivered'}>Not Delivered</Option>
                                    </Select>
                                </Td>
                            </tr>
                            <tr>
                                <Th>Is Cancelled</Th>
                                <Td>
                                    <Select
                                        value={order.isCancelled}
                                        onChange={(e) =>
                                            setOrder({ ...order, isCancelled: e.target.value })
                                        }
                                    >
                                        <Option value={true}>Cancelled</Option>
                                        <Option value={false}>Not Cancelled</Option>
                                    </Select>
                                </Td>
                            </tr>
                            <tr>
                                <Th>Delivery Boy Name</Th>
                                <Td>
                                    <Input type="text" value={order.deliveryBoy?.name}
                                        placeholder='NOT ASSIGNED'
                                        onChange={(e) =>
                                            setOrder({
                                                ...order, deliveryBoy: {
                                                    ...order.deliveryBoy,
                                                    name: e.target.value
                                                }
                                            })
                                        } />
                                </Td>
                            </tr>
                            <tr>
                                <Th>Delivery Boy Phone</Th>
                                <Td>
                                    <Input type="text" value={order.deliveryBoy?.phone}
                                        placeholder='NOT ASSIGNED'

                                        onChange={(e) =>

                                            setOrder({
                                                ...order, deliveryBoy: {
                                                    ...order.deliveryBoy,
                                                    phone: e.target.value
                                                }
                                            })
                                        } />
                                </Td>
                            </tr>
                        </tbody>
                    </Table>
                </Section>

                <Section>
                    <h2>Order Items</h2>
                    <Table>
                        <thead>
                            <tr>
                                <Th>Product</Th>
                                <Th>Price</Th>
                                <Th>Quantity</Th>
                                <Th>Total</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.orderItems.map((item, index) => (
                                <tr key={index}>
                                    <Td>{item.fullproduct.productName}</Td>
                                    <Td>{item.price}</Td>
                                    <Td>{item.quantity}</Td>
                                    <Td>{(item.price * item.quantity).toFixed(2)}</Td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Section>

                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Update Order'}
                </Button>
            </Content>
        </PageContainer>
    );
};

export default EditOrder;

// Styled Components

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
    backgroundColor: 'rgba(0, 0, 0, 0)',
};

// Styled Components
const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding: 20px;
    background-color: #f8f9fa;
    min-height: 100vh;
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
const Loading = styled.div`
    text-align: center;
    margin-top: 50px;
    font-size: 18px;
  `;
const Select = styled.select`
    width: 100%;
    padding: 8px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    background-color: #fff;
    font-size: 14px;
    color: #333;
  
    &:focus {
      outline: none;
      border-color: #007bff;
    }
  `;

const Option = styled.option`
    font-size: 14px;
    color: #333;
    background-color: #fff;
  `;
const Content = styled.div`
    
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
     h1 {
      margin-bottom: 10px;
      font-size: 44px;
      color: #333;
      text-align: center;
      width:'100%';
    }
  `;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  
    img {
      max-width: 150px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  
    button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 10px 15px;
      font-size: 14px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
  
    button:hover {
      background-color: #0056b3;
    }
  `;

const Section = styled.section`
    margin-bottom: 10px;
    max-height:500px;
    overflow:auto;
    h2 {
      font-size: 24px;
      color: #333;
      margin-top:20px;
    }
  `;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  
    thead {
      background-color: #007bff;
      color: white;
    }
  
    th, td {
      padding: 10px;
      border: 1px solid #dee2e6;
    }
  `;

const Th = styled.th`
    text-align: left;
    font-weight: bold;
  `;

const Td = styled.td`
    text-align: left;
  `;

const Input = styled.input`
    width: 100%;
    padding: 8px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
  `;

const Textarea = styled.textarea`
    width: 100%;
    padding: 8px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    resize: vertical;
  `;

const Button = styled.button`
    background-color: #28a745;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 14px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
   margin-right:10px;
    &:hover {
      background-color: #218838;
    }
  `;
const DeleteButton = styled.button`
    background-color: red;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 14px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  
    &:hover {
      background-color: #218838;
    }
  `;