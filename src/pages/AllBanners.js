import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { toast } from "react-hot-toast";
import AWS from "aws-sdk";
import Navbar from "../components/Navbar"; // Assuming you have a Navbar component
import { MoonLoader } from "react-spinners"; // Import spinner

const AllBanners = () => {
    const [newBanner, setNewBanner] = useState({ redirectUrl: "" });
    const [allBanners, setAllBanners] = useState([]);
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    // AWS Configuration
    AWS.config.update({
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_AWS_REGION
    });

    // Upload image to AWS S3
    const uploadImage = async () => {
        if (!file || !newBanner.redirectUrl) {
            toast.error("Please fill all the fields");
            return;
        }
        setIsLoading(true);

        const s3 = new AWS.S3();
        const params = {
            Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
            Key: file.name,
            Body: file,
            ACL: "public-read"
        };

        s3.upload(params, (err, data) => {
            if (err) {
                toast.error("Error in uploading image");
            } else {
                saveBanner(data.Location);
            }
        });
        setIsLoading(false);

    };

    // Save Banner to database
    const saveBanner = async (image) => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/addbanner`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imgUrl: image, redirectUrl: newBanner.redirectUrl })
        });

        const data = await response.json();
        if (data.error) {
            toast.error(data.error);
        } else {
            setAllBanners(data.banners);
            toast.success("Banner added successfully");
        }
    };

    // Delete Banner
    const deleteBanner = async (id) => {
        setIsLoading(true);

        const response = await fetch(`${process.env.REACT_APP_API_URL}/deletebanner`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });

        const data = await response.json();
        if (data.error) {
            toast.error(data.error);
        } else {
            setAllBanners(data.banners);
            toast.success("Banner deleted successfully");
        }
        setIsLoading(false);

    };

    // Get all banners
    const getAllBanners = async () => {
        setIsLoading(true);

        const response = await fetch(`${process.env.REACT_APP_API_URL}/getbanners`);
        const data = await response.json();
        if (data.error) {
            toast.error(data.error);
        } else {
            setAllBanners(data.banners);
        }
        setIsLoading(false);

    };

    useEffect(() => {
        getAllBanners();
    }, []);

    return (
        <PageContainer>
            <Navbar active={'banners'} />

            {
                isLoading ?
                    <div style={loadingStyle}>
                        <MoonLoader size={50} color="#007bff" />
                    </div>
                    :
                    <Content>
                        <Header>
                            <Title>Banners</Title>
                            <Button onClick={uploadImage}>Add Banner</Button>
                        </Header>

                        <BannersList>
                            {allBanners.length > 0 ? (
                                allBanners.map((banner, index) => (
                                    <BannerItem key={index}>
                                        <BannerImage src={banner.imgUrl} alt="Banner" />
                                        <Label>{banner.redirectUrl}</Label>
                                        <Button onClick={() => deleteBanner(banner._id)}>Delete</Button>
                                    </BannerItem>
                                ))
                            ) : (
                                <NoBannersMessage>No Banners Available</NoBannersMessage>
                            )}
                        </BannersList>

                        <FormContainer>
                            <FormItem>
                                <Label htmlFor="image">Banner Image</Label>
                                <Input type="file" onChange={(e) => setFile(e.target.files[0])} />
                            </FormItem>
                            <FormItem>
                                <Label htmlFor="redirect">Course Id</Label>
                                <Input
                                    type="text"
                                    id="redirect"
                                    placeholder="Enter Course Id"
                                    onChange={(e) => setNewBanner({ ...newBanner, redirectUrl: e.target.value })}
                                />
                            </FormItem>
                        </FormContainer>
                    </Content>
            }
        </PageContainer>
    );
};

export default AllBanners;

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

const BannersList = styled.div`
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 15px;
`;

const BannerItem = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background-color: #f4f4f4;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const BannerImage = styled.img`
    width: 80px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
`;

const NoBannersMessage = styled.p`
    font-size: 16px;
    color: #999;
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
