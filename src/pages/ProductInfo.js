import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom'
import { MoonLoader } from 'react-spinners';
import styled from 'styled-components';
import AWS from 'aws-sdk'

const ProductInfo = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const navigate = useNavigate()

  const getProduct = () => {
    fetch(`${process.env.REACT_APP_API_URL}/getProductById`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId: id })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        if (data.message == 'success') {
          let temp = data.product;
          console.log(temp);

          setProduct(temp)
        }
        else {
          toast.error('Error Fetching Product Data')
        }
      })
      .catch((err) => {
        console.log(err)
        toast.error('Error Fetching Product Data')
      })
  }

  useEffect(() => { getProduct() }, [id])


  const deleteProduct = (productId) => {
    fetch(`${process.env.REACT_APP_API_URL}/deleteProductById`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.message === 'Product deleted successfully') {
          toast.success('Product deleted successfully');
          navigate(-1);
        } else if (data.message === 'Product not found') {
          toast.error('Product not found');
        } else {
          toast.error('Error deleting product');
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error('Error deleting product');
      });
  };
  
  const addProductImage = async (file) => {
    if (!file) {
      toast.error("Please select an image");
      return false;
    }

    setIsLoading(true); // Start loading indicator
    try {
      // Upload the file and get its location
      let fileLocation = await uploadFile(file);

      // Add the new image to the product's images array
      let newProductImages = [
        ...(product.productImages || []), // Safeguard against undefined images array
        fileLocation
      ];


      // Save the updated product
      await saveProduct(newProductImages);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("An error occurred while uploading the image");
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  const saveProduct = async (newProductImages = []) => {
    if (newProductImages.length == 0) {
      newProductImages = product.productImages
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/saveEditedProductById`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product: { ...product, productImages: newProductImages } }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Product edited successfully");
        getProduct()
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("An error occurred while saving the product");
    }
  };

  const uploadFile = async (file) => {
    return new Promise((resolve, reject) => {


      AWS.config.update({
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_AWS_REGION,
      });

      if (file) {
        const s3 = new AWS.S3();
        const params = {
          Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
          Key: file.name,
          Body: file,
          ACL: 'public-read', // Set the appropriate ACL for your use case
          ContentDisposition: 'inline', // Tell the browser to display the file inline, not download
          ContentType: file.type // Ensure correct content type for your file
        };

        s3.upload(params, (err, data) => {
          if (err) {
            console.error('Error uploading file:', err);
            toast.error('Error in uploading video');
            reject('Error in uploading file');
          } else {
            console.log('File uploaded successfully:', data.Location);
            resolve(data.Location); // Resolve the promise with the file location
          }
        });
      } else {
        toast.error('Please Try again');
        reject('No file provided');
      }
    });
  };

  const deleteProductImage = async (image) => {
    let prodimages = product.productImages;
    prodimages = prodimages.filter((img) => {
      return img !== image
    })

    await saveProduct(prodimages);
    await deleteFile(image)
  }

  const deleteFile = async (fileLocation) => {
    return new Promise((resolve, reject) => {
      // Configure AWS SDK
      AWS.config.update({
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_AWS_REGION,
      });

      // Extract the file key from the file URL
      const fileKey = fileLocation.split('/').pop();  // Assuming the fileLocation is an S3 URL like 'https://s3.amazonaws.com/bucket-name/file-name'

      if (fileKey) {
        const s3 = new AWS.S3();
        const params = {
          Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
          Key: fileKey, // S3 object key is the last part of the URL (file name)
        };

        // Deleting the file from S3
        s3.deleteObject(params, (err, data) => {
          if (err) {
            console.error('Error deleting file:', err);
            toast.error('Error in deleting Existing file');
            reject('Error in deleting Existing file');
          } else {
            console.log('File deleted successfully:', data);
            resolve('File deleted successfully');
          }
        });
      } else {
        toast.error('Invalid file location');
        reject('Invalid file location');
      }
    });
  };

  if (isLoading) {
    return <Loading>
      <div style={loadingStyle}>
        <p>Uploading Question...Please do not refresh</p>
        <MoonLoader size={50} color="#007bff" />
      </div>
    </Loading>;
  }

  if (!product) {
    return <Loading>Loading product details...</Loading>;
  }

  return (
    <PageContainer>
      <BackButton onClick={() => navigate(-1)}>← Back</BackButton>
      <Content>
        <h1>Product Info</h1>
        <Section>
          <h2>Basic Details</h2>
          <Table>
            <tbody>
              <tr>
                <Th>Product Price</Th>
                <Td>
                  <Input
                    type="text"
                    value={product.productName}
                    onChange={(e) =>
                      setProduct((prev) => ({ ...prev, productName: e.target.value }))
                    }
                  />
                </Td>
              </tr>
              <tr>
                <Th>Product Price</Th>
                <Td>
                  <Input
                    type="text"
                    value={product.productPrice}
                    onChange={(e) =>
                      setProduct((prev) => ({ ...prev, productPrice: e.target.value }))
                    }
                  />
                </Td>
              </tr>

              <tr>
                <Th>Product Description</Th>
                <Td>
                  <Textarea
                    type="text"
                    value={product.productDescription}
                    onChange={(e) =>
                      setProduct((prev) => ({ ...prev, productDescription: e.target.value }))
                    }
                  />
                </Td>
              </tr>
              <tr>
                <Th>Product Category</Th>
                <Td>
                  <Select
                    value={product.productCategory}
                    onChange={(e) =>
                      setProduct((prev) => ({ ...prev, productCategory: e.target.value }))
                    }
                  >
                    <Option value="">None</Option>
                    <Option value="JEE">JEE</Option>
                    <Option value="NEET">NEET</Option>
                  </Select>
                </Td>
              </tr>
              <tr>
                <Th>Product Rating</Th>
                <Td>
                  <Input
                    type="text"
                    value={product.productRating}
                    onChange={(e) =>
                      setProduct((prev) => ({ ...prev, productRating: e.target.value }))
                    }
                  />
                </Td>
              </tr>
              <tr>
                <Th>Product Stock</Th>
                <Td>
                  <Select
                    value={product.productStock}
                    onChange={(e) =>
                      setProduct((prev) => ({ ...prev, productStock: e.target.value }))
                    }
                  >
                    <Option value="INSTOCK">INSTOCK</Option>
                    <Option value="OUTOFSTOCK">OUT OF INSTOCK</Option>
                  </Select>
                </Td>
              </tr>
              <tr>
                <Th>Product Discount %</Th>
                <Td>
                  <Input
                    type="number"
                    value={product.productDiscount}
                    onChange={(e) =>
                      setProduct((prev) => ({ ...prev, productDiscount: e.target.value }))
                    }
                  />
                </Td>
              </tr>
              <tr>
                <Th>Add Product Image</Th>
                <Td>
                  <input
                    type="file"
                    id="productImage"
                    name="productImage"
                    accept="image/jpeg, image/png"
                    multiple={false}
                    onChange={(e) => {

                      addProductImage(e.target.files[0])
                    }}
                    style={{ display: "none" }} // Hide the input
                  />
                  <Button
                    onClick={() => document.getElementById("productImage").click()} // Trigger the input
                  >
                    Add New Image
                  </Button>
                </Td>
              </tr>
              <tr>
                <Th>Product Images</Th>
                <Td>

                  {
                    product.productImages.map((image, index) => {
                      return (
                        <ProductImageContainer key={index}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            onClick={() => deleteProductImage(image)}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>

                          <img src={image} alt="product image" />
                        </ProductImageContainer>
                      )
                    })
                  }
                </Td>
              </tr>

            </tbody>
          </Table>
        </Section>
        <Button
          onClick={() => saveProduct()} // Trigger the input
        >
          Save Product
        </Button>
      </Content>
      <DeleteButton onClick={() => deleteProduct(id)}>← Delete Product Permanently</DeleteButton>

    </PageContainer>
  )
}

export default ProductInfo


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
margin-bottom: 30px;
max-height:500px;
overflow:auto;
h2 {
  margin-bottom: 10px;
  font-size: 24px;
  color: #333;
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

const DateInput = styled.input`
width: 20%;
padding: 8px;
border: 1px solid #dee2e6;
border-radius: 4px;
margin-right:10px;
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
margin-left:10px;
&:hover {
  background-color: #218838;
}
`;

const ProductImageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;

  svg {
    cursor: pointer;
    width: 24px;
    height: 24px;
    color: #333;

    &:hover {
      color: #ff0000; /* Changes color on hover */
    }
  }

  img {
    max-width: 100px;
    max-height: 100px;
    object-fit: cover;
    border-radius: 4px;
  }
`;