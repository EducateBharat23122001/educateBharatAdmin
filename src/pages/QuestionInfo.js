import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import AWS from 'aws-sdk'
import { MoonLoader } from 'react-spinners';

const QuestionInfo = () => {
    const { id } = useParams();
    const [question, setQuestion] = useState(null)
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false);
    const [tempAnswer, setTempAnswer] = useState("");
    const getQuestion = () => {
        fetch(`${process.env.REACT_APP_API_URL}/getQuestionData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ questionId: id })
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.message == 'success') {
                    let temp = data.question;

                    console.log(data.question);
                    setQuestion(temp)
                }
                else {
                    toast.error('Error Fetching Quiz Data')
                }
            })
            .catch((err) => {
                console.log(err)
                toast.error('Error Fetching Quiz Data')
            })
    }


    useEffect(() => {
        getQuestion()
    }, [id])

    const saveQuestionPdf = async (file) => {
        if (!file) {
            toast.error("Please upload a PDF file");
            return false;
        }
        setIsLoading(true); // Stop loading whether the upload is successful or failed

        try {
            let fileLocation = await uploadFile(file);
            fetch(`${process.env.REACT_APP_API_URL}/updateQuestionPdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    questionId: id,
                    questionPdf: fileLocation
                })
            })
                .then((res) => res.json())
                .then(async (data) => {
                    console.log(data)
                    if (data.message == 'success') {
                        toast.success('Question Updated Successfully')
                        await deleteFile(fileLocation);
                        setQuestion(data.question);


                    } else {

                        toast.error('Error Adding Question')
                    }
                })
                .catch((err) => {
                    console.log(err)
                    toast.error('Error Adding Question')
                })
        }
        catch (error) {
            console.error("Error uploading PDF:", error);
            toast.error('An error occurred while uploading the PDF');
        } finally {
            setIsLoading(false); // Stop loading whether the upload is successful or failed
        }

    }
    const saveQuestion = async () => {
        setIsLoading(true);
        try {
            fetch(`${process.env.REACT_APP_API_URL}/updateQuestion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question })
            })
                .then((res) => res.json())
                .then(async (data) => {
                    console.log(data)
                    if (data.message == 'success') {
                        toast.success('Question Updated Successfully')

                        setQuestion(data.question);


                    } else {

                        toast.error('Error Adding Question')
                    }
                })
                .catch((err) => {
                    console.log(err)
                    toast.error('Error Adding Question')
                })
        }
        catch (error) {
            console.error("Error uploading PDF:", error);
            toast.error('An error occurred while uploading the PDF');
        } finally {
            setIsLoading(false); // Stop loading whether the upload is successful or failed
        }

    }

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
    const handleViewPdf = (pdfUrl) => {
        if (pdfUrl) {
            window.open(pdfUrl, '_blank'); // Opens the PDF in a new browser tab
        } else {
            alert("PDF URL is not available");
        }
    };
    if (isLoading) {
        return <Loading>
            <div style={loadingStyle}>
                <p>Uploading Question...Please do not refresh</p>
                <MoonLoader size={50} color="#007bff" />
            </div>
        </Loading>;
    }

    if (!question) {
        return <Loading>Loading question details...</Loading>;
    }
    return (
        <PageContainer>
            <BackButton onClick={() => navigate(-1)}>← Back</BackButton>
            <Content>
                <h1>Question Info</h1>

                <Section>
                    <h2>Basic Details</h2>
                    <Table>
                        <tbody>
                            <tr>
                                <Th>Question Order</Th>
                                <Td>
                                    <Input
                                        type="number"
                                        value={question.questionOrder}
                                        onChange={(e) =>
                                            setQuestion((prev) => ({ ...prev, questionOrder: e.target.value }))
                                        }
                                    />
                                </Td>
                            </tr>
                            <tr>
                                <Th>Question Name</Th>
                                <Td>
                                    <Input
                                        type="text"
                                        value={question.questionName}
                                        onChange={(e) =>
                                            setQuestion((prev) => ({ ...prev, questionName: e.target.value }))
                                        }
                                    />
                                </Td>
                            </tr>
                            <tr>
                                <Th>Question Marks</Th>
                                <Td>
                                    <Input
                                        type="number"
                                        value={question.questionMarks}
                                        onChange={(e) =>
                                            setQuestion((prev) => ({ ...prev, questionMarks: e.target.value }))
                                        }
                                    />
                                </Td>
                            </tr>


                            <tr>
                                <Th>Question Negative Marks</Th>
                                <Td>
                                    <Input
                                        type="number"
                                        value={question.questionNegativeMarks}
                                        onChange={(e) =>
                                            setQuestion((prev) => ({ ...prev, questionNegativeMarks: e.target.value }))
                                        }
                                    />
                                </Td>
                            </tr>


                            <tr>
                                <Th>Question Subject</Th>
                                <Td>
                                    <Select
                                        value={question.questionSubject ? question.questionSubject.toUpperCase() : ''}
                                        onChange={(e) =>
                                            setQuestion((prev) => ({
                                                ...prev,
                                                questionSubject: e.target.value.toUpperCase()
                                            }))
                                        }
                                    >
                                        <Option value="">Select</Option>
                                        <Option value="CHEMISTRY">CHEMISTRY</Option>
                                        <Option value="PHYSICS">PHYSICS</Option>
                                        <Option value="MATHS">MATHS</Option>
                                        <Option value="BIOLOGY">BIOLOGY</Option>
                                    </Select>

                                </Td>
                            </tr>


                            <tr>
                                <Th>Question Pdf</Th>
                                <Td>
                                    {question.questionPdf ?
                                        (
                                            <Button onClick={() => handleViewPdf(question.questionPdf)}>View</Button>
                                        )
                                        : question.questiionPdf ? (
                                            <Button onClick={() => handleViewPdf(question.questiionPdf)}>View</Button>
                                        ) : (
                                            '--No Pdf--'
                                        )}

                                    {' '}


                                    <input
                                        type="file"
                                        id="questionPdf"
                                        name="questionPdf"
                                        accept="application/pdf"
                                        multiple={false}
                                        onChange={(e) => {

                                            saveQuestionPdf(e.target.files[0]);
                                        }}
                                        style={{ display: "none" }} // Hide the input
                                    />
                                    <BackButton
                                        onClick={() => document.getElementById("questionPdf").click()}
                                    >Change Pdf</BackButton>

                                </Td>
                            </tr>


                            <tr>
                                <Th>Question Type</Th>
                                <Td>
                                    <Select
                                        value={question.questionType ? question.questionType : ''}
                                        onChange={(e) =>
                                            setQuestion((prev) => ({ ...prev, questionType: e.target.value }))
                                        }
                                    >
                                        <Option value="">SELECT</Option>

                                        <Option value="MCQ">MCQ</Option>
                                        <Option value="Short Answer">Short Answer</Option>
                                        <Option value="MoreThanOne">More Than One</Option>

                                    </Select>

                                </Td>
                            </tr>



                            <tr>
                                <Th>Question Answer</Th>
                                <Td>

                                    <Input
                                        type="text"
                                        value={tempAnswer} // Display the temporary input
                                        onChange={(e) => setTempAnswer(e.target.value)}
                                    />

                                    <BackButton
                                        onClick={() => {
                                            if (tempAnswer.trim()) {
                                                if (question.questionType == 'MoreThanOne') {
                                                    setQuestion((prev) => ({
                                                        ...prev,
                                                        questionAnswer: Array.isArray(prev.questionAnswer)
                                                            ? [...prev.questionAnswer, tempAnswer.trim()] // Append to existing array
                                                            : [tempAnswer.trim()], // Convert string to array
                                                    }));
                                                }
                                                else {
                                                    setQuestion((prev) => ({
                                                        ...prev,
                                                        questionAnswer: [tempAnswer.trim()], // Convert string to array
                                                    }));
                                                }
                                                setTempAnswer(''); // Clear input
                                            }
                                        }}
                                    >
                                        Add Answer
                                    </BackButton>
                                </Td>
                            </tr>
                            <tr>
                                <Th></Th>
                                <Td>
                                    {
                                        Array.isArray(question?.questionAnswer) ? (
                                            question?.questionAnswer?.map((item, index) => (
                                                <Button key={index} onClick={() => {
                                                    // Remove the answer when clicked
                                                    setQuestion((prev) => ({
                                                        ...prev,
                                                        questionAnswer: prev.questionAnswer.filter((_, i) => i !== index),
                                                    }));
                                                }}>
                                                    {item}{'  '}x
                                                </Button>
                                            ))
                                        ) : (
                                            <Button
                                                onClick={() => {
                                                    setQuestion((prev) => ({
                                                        ...prev,
                                                        questionAnswer: [], // Convert input to array
                                                    }));
                                                }}
                                            >
                                                {question?.questionAnswer}{'  '}x
                                            </Button>
                                        )
                                    }


                                </Td>
                            </tr>
                        </tbody>
                    </Table>
                </Section>

                {
                    question.questionType != 'Short Answer' &&
                    <Section>
                        <h2>Question Options</h2>
                        <Table>
                            <tbody>
                                <tr>
                                    <Th>Option 1</Th>
                                    <Td>
                                        <Input
                                            type="text"
                                            value={question.questionOptions[0]}
                                            onChange={(e) =>
                                                setQuestion((prev) => ({
                                                    ...prev,
                                                    questionOptions: [
                                                        e.target.value, // Update the first option with the new value
                                                        ...prev.questionOptions.slice(1), // Preserve the rest of the options
                                                    ],
                                                }))
                                            }
                                        />
                                    </Td>
                                </tr>
                                <tr>
                                    <Th>Option 2</Th>
                                    <Td>
                                        <Input
                                            type="text"
                                            value={question.questionOptions[1]} // The second option in the array
                                            onChange={(e) =>
                                                setQuestion((prev) => ({
                                                    ...prev,
                                                    questionOptions: [
                                                        ...prev.questionOptions.slice(0, 1), // Keep the first option as is
                                                        e.target.value, // Update the second option with the new value
                                                        ...prev.questionOptions.slice(2), // Keep the rest of the options as is
                                                    ],
                                                }))
                                            }
                                        />
                                    </Td>
                                </tr>
                                <tr>
                                    <Th>Option 3</Th>
                                    <Td>
                                        <Input
                                            type="text"
                                            value={question.questionOptions[2]} // The third option in the array
                                            onChange={(e) =>
                                                setQuestion((prev) => ({
                                                    ...prev,
                                                    questionOptions: [
                                                        ...prev.questionOptions.slice(0, 2), // Keep the first two options as is
                                                        e.target.value, // Update the third option with the new value
                                                        ...prev.questionOptions.slice(3), // Keep the rest of the options as is
                                                    ],
                                                }))
                                            }
                                        />

                                    </Td>
                                </tr>

                                <tr>
                                    <Th>Option 4</Th>
                                    <Td>
                                        <Input
                                            type="text"
                                            value={question.questionOptions[3]} // The third option in the array
                                            onChange={(e) =>
                                                setQuestion((prev) => ({
                                                    ...prev,
                                                    questionOptions: [
                                                        ...prev.questionOptions.slice(0, 3), // Keep the first two options as is
                                                        e.target.value, // Update the third option with the new value
                                                        ...prev.questionOptions.slice(4), // Keep the rest of the options as is
                                                    ],
                                                }))
                                            }
                                        />

                                    </Td>
                                </tr>
                            </tbody>
                        </Table>

                    </Section>
                }
            </Content>
            <Button onClick={() => {
                saveQuestion()
            }}>Save Question</Button>
        </PageContainer>
    )
}

export default QuestionInfo

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
    margin-top: 10px;
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
margin-right:5px;
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