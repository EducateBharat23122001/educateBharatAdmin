import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import AWS from 'aws-sdk'
import { MoonLoader } from 'react-spinners';

const AddQuestion = () => {
  const { quizid, quiztype } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const [question, setQuestion] = useState({
    "questionName": "",
    "questionOrder": 0,
    "questionType": "MCQ",
    "quizType": quiztype,
    "quizId": quizid,
    "questionOptions": [],
    "questionAnswer": [],
    "questionMarks": 4,
    "questionNegativeMarks": 1,
    "questionSubject": "",
    "questionPdf": null
  });
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const [tempAnswer, setTempAnswer] = useState("");

  useEffect(() => {
    if (question.questionType == 'Short Answer') {
      setQuestion((prev) => ({
        ...prev,
        questionNegativeMarks: 0,
        questionOptions: []
      }));
      console.log(question.questionType)

    }
    else if (question.questionType != 'Short Answer') {

      setQuestion((prev) => ({
        ...prev,
        questionNegativeMarks: 1,
        questionOptions: ['A', 'B', 'C', 'D']
      }));
    }

  }, [question.questionType]);


  const validateForm = () => {
    if (!question.questionName.trim()) {
      toast.error("Question Name is required");
      return false;
    }

    if (question.questionName.length < 1) {
      toast.error("Question Name must be at least 1 characters long");
      return false;
    }

    if (question.questionAnswer.length == 0) {
      toast.error("Question Answer is required");
      return false;
    }

    if (question.questionType === "MCQ" && question.questionOptions.length < 4) {
      toast.error("Please provide at least 4 options for MCQ");
      return false;
    }

    if (question.questionType === "MCQ") {
      const emptyOption = question.questionOptions.find(option => !option || option.trim() === "");
      if (emptyOption !== undefined) {
        toast.error("All MCQ options must be filled");
        return false;
      }
    }

    if (!question.questionMarks || isNaN(question.questionMarks) || question.questionMarks <= 0) {
      toast.error("Question Marks must be a positive number");
      return false;
    }

    if (
      question.questionNegativeMarks < 0 ||
      isNaN(question.questionNegativeMarks)
    ) {
      toast.error("Negative Marks must be a non-negative number");
      return false;
    }

    if (!question.questionSubject) {
      toast.error("Please select a Question Subject");
      return false;
    }

    if (!file) {
      toast.error("Please upload a PDF file");
      return false;
    }

    return true;
  };

  const handleViewPdf = (pdfUrl) => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank'); // Opens the PDF in a new browser tab
    } else {
      alert("PDF URL is not available");
    }
  };


  const addQuestion = async () => {
    // if (!validateForm()) {
    //   return; // Stop execution if validation fails
    // }

    setIsLoading(true)
    try {
      let fileLocation = null;

      if (file) { fileLocation = await uploadFile(file); }

      fetch(`${process.env.REACT_APP_API_URL}/addQuestionToQuiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...question,
          questionPdf: fileLocation
        })
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data)
          if (data.message == 'success') {
            toast.success('Question Added Successfully')

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
  if (isLoading) {
    return <Loading>
      <div style={loadingStyle}>
        <p>Uploading Question...Please do not refresh</p>
        <MoonLoader size={50} color="#007bff" />
      </div>
    </Loading>;
  }
  return (
    <PageContainer>
      <BackButton onClick={() => navigate(-1)}>← Back</BackButton>

      <Content>
        <h1>Add Question Form</h1>
        <Section>
          <h2>Basic Details</h2>
          <Table>
            <tbody>
              <tr>
                <Th>Question Name</Th>
                <Td>
                  <Input
                    type="text"
                    placeholder='Enter Question Name'
                    value={question.questionName}
                    onChange={(e) =>
                      setQuestion((prev) => ({ ...prev, questionName: e.target.value }))
                    }
                  />
                </Td>
              </tr>
              <tr>
                <Th>Question Order</Th>
                <Td>
                  <Input
                    type="number"
                    placeholder='Enter Question Order'
                    value={question.questionOrder}
                    onChange={(e) =>
                      setQuestion((prev) => ({ ...prev, questionOrder: e.target.value }))
                    }
                  />
                </Td>
              </tr>
              <tr>
                <Th>Question Marks</Th>
                <Td>
                  <Input
                    type="number"
                    placeholder='Enter Question Marks'
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
                    placeholder='Enter Negative Question Marks'
                    value={question.questionNegativeMarks}
                    onChange={(e) =>
                      setQuestion((prev) => ({ ...prev, questionNegativeMarks: e.target.value }))
                    }
                  />
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
              <tr>
                <Th>Question Type</Th>
                <Td>
                  <Select
                    value={question.questionType}
                    onChange={(e) =>
                      setQuestion((prev) => ({ ...prev, questionType: e.target.value }))
                    }
                  >
                    <Option value="MCQ">MCQ</Option>
                    <Option value="Short Answer">Short Answer</Option>
                    <Option value="MoreThanOne">More Than One</Option>

                  </Select>
                </Td>
              </tr>

              <tr>
                <Th>Question Subject</Th>
                <Td>
                  <Select
                    value={question.questionSubject}
                    onChange={(e) =>
                      setQuestion((prev) => ({ ...prev, questionSubject: e.target.value }))
                    }
                  >
                    <Option value="PHYSICS">PHYSICS</Option>
                    <Option value="MATHS">MATHS</Option>
                    <Option value="CHEMISTRY">CHEMISTRY</Option>
                    <Option value="BIOLOGY">BIOLOGY</Option>

                  </Select>
                </Td>
              </tr>

              <tr>
                <Th>Question Pdf</Th>

                <Td>

                  <input
                    type="file"
                    id="questionPdf"
                    name="questionPdf"
                    accept="application/pdf"
                    multiple={false}
                    onChange={(e) => {
                      setFile(e.target.files[0])
                    }}
                  />
                </Td>

                {/* <img src={course.courseImage} alt={course.courseName} /> */}

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
                      placeholder="Enter Option 1"
                      value={question.questionOptions[0]}
                      onChange={(e) =>
                        setQuestion((prev) => ({
                          ...prev,
                          questionOptions: [
                            e.target.value, // Update the first option
                            ...prev.questionOptions.slice(1), // Keep the rest of the options unchanged
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
                      placeholder="Enter Option 2"
                      value={question.questionOptions[1]} // Index 1 for the second option
                      onChange={(e) =>
                        setQuestion((prev) => ({
                          ...prev,
                          questionOptions: [
                            ...prev.questionOptions.slice(0, 1), // Keep the first option unchanged
                            e.target.value, // Update the second option
                            ...prev.questionOptions.slice(2), // Keep the rest unchanged
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
                      placeholder="Enter Option 3"
                      value={question.questionOptions[2]} // Index 2 for the third option
                      onChange={(e) =>
                        setQuestion((prev) => ({
                          ...prev,
                          questionOptions: [
                            ...prev.questionOptions.slice(0, 2), // Keep the first two options unchanged
                            e.target.value, // Update the third option
                            ...prev.questionOptions.slice(3), // Keep the rest unchanged
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
                      placeholder="Enter Option 4"
                      value={question.questionOptions[3]} // Index 3 for the fourth option
                      onChange={(e) =>
                        setQuestion((prev) => ({
                          ...prev,
                          questionOptions: [
                            ...prev.questionOptions.slice(0, 3), // Keep the first three options unchanged
                            e.target.value, // Update the fourth option
                            ...prev.questionOptions.slice(4), // Keep the rest unchanged (if there are more options)
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
      <BackButton onClick={() => addQuestion()}>Save Question</BackButton>

    </PageContainer>
  )
}

export default AddQuestion



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
    margin-right: 10px;

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