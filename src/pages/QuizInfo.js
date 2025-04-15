import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import styled from "styled-components";
import AWS from 'aws-sdk'
import { MoonLoader } from 'react-spinners';

const QuizInfo = () => {
  const { id, quizType } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [timeLimit, setTimeLimit] = useState({
    hr: 0,
    min: 0,
    sec: 0
  })
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [answersString, setAnswersString] = useState('');

  const navigate = useNavigate()
  const getQuiz = () => {
    fetch(`${process.env.REACT_APP_API_URL}/getQuizData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quizId: id, quizType })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message == 'success') {
          let temp = data.quiz;

          console.log(temp);

          setQuiz(temp)
          let timeMStoHMS = convertMillisecondsTohms(temp.timeLimit);
          setTimeLimit(timeMStoHMS);
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
    getQuiz();
  }, [id]);
  function convertMillisecondsTohms(ms) {
    let hr = Math.floor(ms / (1000 * 60 * 60));
    let min = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    let sec = Math.floor((ms % (1000 * 60)) / 1000);
    return { hr, min, sec }
  }

  function convertHmsToMilliseconds({ hr, min, sec }) {
    const hoursInMilliseconds = hr * 60 * 60 * 1000;
    const minutesInMilliseconds = min * 60 * 1000;
    const secondsInMilliseconds = sec * 1000;

    return hoursInMilliseconds + minutesInMilliseconds + secondsInMilliseconds;
  }

  const saveeditedquizbyid = () => {
    let temp = {
        _id: quiz._id,  // Ensure the ID is included
        quizType: quizType,
        quizName: quiz.quizName,
        access: quiz.access,
        timeLimit: convertHmsToMilliseconds(timeLimit),
    };

    console.log(temp);

    fetch(`${process.env.REACT_APP_API_URL}/updateQuizById`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quiz: temp })
    })
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
        if (data.message === 'success') {
            toast.success('Quiz Updated Successfully');
            getQuiz();
        } else {
            toast.error('Error Updating Quiz');
        }
    })
    .catch((err) => console.error(err));
};

  const addQuizPdf = async (file) => {


    setIsLoading(true);
    try {
      // Upload the PDF file and get the file location
      let fileLocation = await uploadFile(file);

      if (fileLocation) {
        // Send the API request to add the notes
        fetch(`${process.env.REACT_APP_API_URL}/addAfterSubmissionPdfToQuiz`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            quizId: quiz._id,
            quizType: quizType,
            pdfLink: fileLocation

          })
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data)
            if (data.message == 'success') {
              toast.success('After Submission Pdf Added Successfully')
              setQuiz({
                ...quiz,
                afterSubmissionPdf: data.quiz.afterSubmissionPdf
              })
            } else {
              toast.error('Error Adding After Submission Pdf')
            }
          }
          )
      } else {
        toast.error('Pdf not uploaded');
      }
    } catch (error) {
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

  const handleViewPdf = (pdfUrl) => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank'); // Opens the PDF in a new browser tab
    } else {
      alert("PDF URL is not available");
    }
  };

  const deleteQuestionFromQuiz = (question) => {

    fetch(`${process.env.REACT_APP_API_URL}/deleteQuestion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quizId: quiz._id, quizType: quiz.quizType, questionId: question._id })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        if (data.message == 'success') {
          deleteFile(question.questionPdf);
          toast.success('Question Deleted Successfully')
          getQuiz()
        } else {
          toast.error('Error Deleting Question')
        }
      })
      .catch((err) => {
        console.log(err)
        toast.error('Error Deleting Question')
      })
  }


  const deleteFile = async (fileLocation) => {
    if (!fileLocation) return
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

  if (!quiz) {
    return <Loading>Loading quiz details...</Loading>;
  }

  if (isLoading) {
    return <Loading>
      <div style={loadingStyle}>
        <p>Uploading File...Please do not refresh</p>
        <MoonLoader size={50} color="#007bff" />
      </div>
    </Loading>;
  }

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };
  const handleSavePdfs = async () => {
    if (selectedFiles.length !== quiz.quizQNA.length) {
      alert("Please select exactly one PDF per question.");
      return;
    }

    // Iterate over questions and files
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const question = quiz.quizQNA[i];

      // Call saveQuestionPdf for each question
      await saveQuestionPdf(file, question._id);
    }

    alert("All PDFs uploaded successfully!");
  };
  const saveQuestionPdf = async (file, questionId) => {
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
          questionId: questionId,
          questionPdf: fileLocation
        })
      })
        .then((res) => res.json())
        .then(async (data) => {
          console.log(data)
          if (data.message == 'success') {
            toast.success('Question Updated Successfully')

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


  function parseAnswerString(answerString) {
    const result = [];
    let temp = '';
    let insideBraces = false;

    for (const char of answerString) {
      if (char === '{') {
        insideBraces = true;
        temp += char;
      } else if (char === '}') {
        insideBraces = false;
        temp += char;
        result.push(temp);
        temp = '';
      } else if (char === ',' && !insideBraces) {
        if (temp.trim()) {
          result.push(temp.trim());
        }
        temp = '';
      } else {
        temp += char;
      }
    }

    // Push the last collected value, if any
    if (temp.trim()) {
      result.push(temp.trim());
    }

    // Convert parsed strings to arrays
    return result.map(answer => {
      if (answer === '*' || !answer) {
        return []; // Handle empty or skipped answers
      } else if (answer.startsWith('{') && answer.endsWith('}')) {
        return answer.slice(1, -1).split(','); // Parse multi-answer sets
      } else {
        return [answer]; // Wrap single answers
      }
    });
  }


  const mapAnswersToQuestions = async () => {
    let quizId = id;
    setIsLoading(true);



    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/mapAnswers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quizId,
          quizType,
          answersArray: parseAnswerString(answersString)
        })
      });

      const data = await response.json();

      if (data.message === 'Answers mapped and questions updated successfully') {
        toast.success('Answers mapped successfully');
      } else {
        toast.error('Error mapping answers');
      }
    } catch (error) {
      console.error('Error mapping answers:', error);
      toast.error('An error occurred while mapping answers');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <PageContainer>
      <BackButton onClick={() => navigate(-1)}>← Back</BackButton>
      <Content>
        <h1>Quiz Info</h1>

        <Section>
          <h2>Basic Details</h2>
          <Table>
            <tbody>
              <tr>
                <Th>Quiz Name</Th>
                <Td>
                  <Input
                    type="text"
                    value={quiz.quizName}
                    onChange={(e) =>
                      setQuiz((prev) => ({ ...prev, quizName: e.target.value }))
                    }
                  />
                </Td>
              </tr>

              <tr>
                <Th>Quiz ID</Th>
                <Td>
                  <Input
                    type="text"
                    value={quiz._id}
                  />
                </Td>
              </tr>

              <tr>
                <Th>Quiz Access</Th>
                <Td>
                  <Select
                    value={quiz.access}
                    onChange={(e) =>
                      setQuiz((prev) => ({ ...prev, access: e.target.value }))
                    }
                  >
                    <Option value="FREE">FREE</Option>
                    <Option value="PAID">PAID</Option>
                  </Select>

                </Td>
              </tr>

              <tr>
                <Th>Quiz Time Limit</Th>
                <Td>
                  hr :{' '}
                  <DateInput
                    type="number"
                    value={timeLimit.hr}
                    onChange={(e) => setTimeLimit({ ...timeLimit, hr: e.target.value })}

                  />
                  min :{' '}
                  <DateInput
                    type="number"
                    value={timeLimit.min}
                    onChange={(e) => setTimeLimit({ ...timeLimit, min: e.target.value })}
                  />
                  sec :{' '}
                  <DateInput
                    type="number"
                    value={timeLimit.sec}
                    onChange={(e) => setTimeLimit({ ...timeLimit, sec: e.target.value })}
                  />
                </Td>
              </tr>
              <tr>
                <Th>Quiz Type</Th>
                <Td>
                  {quizType}

                </Td>
              </tr>
              <tr>
                <Th>Quiz Parent {quizType}  ID</Th>
                <Td>
                  {quiz.parentId}

                </Td>
              </tr>

            </tbody>
          </Table>

          <Button onClick={() => {
            saveeditedquizbyid()
          }}>Save Info</Button>
        </Section>
        <Section>
          <h2>Quiz Pdf</h2>
          <Table>
            <tbody>
              <tr>
                <Td>
                  {
                    quiz.afterSubmissionPdf ?
                      <BackButton onClick={() => handleViewPdf(quiz.afterSubmissionPdf)}
                      >Show Existing Pdf</BackButton>
                      :
                      '--No Pdf--'
                  }

                  <input
                    type="file"
                    id="quizPdf"
                    name="quizPdf"
                    accept="application/pdf"
                    multiple={false}
                    onChange={(e) => {
                      addQuizPdf(e.target.files[0])

                    }}
                    style={{ display: "none" }} // Hide the input
                  />
                  {' '}
                  <Button
                    onClick={() => document.getElementById("quizPdf").click()} // Trigger the input
                  >
                    Add New Pdf
                  </Button>

                </Td>

                {/* <img src={course.courseImage} alt={course.courseName} /> */}

              </tr>
            </tbody>
          </Table>
        </Section>
        <h2>QNA</h2>
        <br />
        <Section>


          <Table>
            <tr>
              <Th>Add New Question</Th>

              <Td><Button onClick={() => navigate(`/addquestion/${quizType}/${id}`)}>Add Question</Button></Td>
            </tr>

            <tr>
              <Th>Upload PDFs for Questions</Th>

              <Td>
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handleFileChange}
                />
                <Button onClick={handleSavePdfs}>Upload PDFs</Button></Td>
            </tr>


            <tr>
              <Th>Upload All Answers for Questions</Th>

              <Td>
                <Input
                  type="text"
                  value={answersString}
                  onChange={(e) =>
                    setAnswersString(e.target.value)
                  }
                />
                <Button onClick={mapAnswersToQuestions}>Upload Answers</Button></Td>
            </tr>
          </Table>

          <Table>

            <thead>
              <tr>
                <Th>Sno.</Th>

                <Th>Question Order</Th>
                <Th>Question Name</Th>
                <Th>Question Type</Th>
                <Th>Question Answer</Th>

                <Th>Question Pdf</Th>

                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {quiz.quizQNA
                .sort((a, b) => (a.questionOrder || 0) - (b.questionOrder || 0)) // Sort by questionOrder, defaulting to 0 if undefined
                .map((question, index) => (
                  <tr key={question._id}>
                    <Td>{index + 1}</Td>

                    <Td>{question.questionOrder ? question.questionOrder : ''}</Td>
                    <Td>{question.questionName ? question.questionName : '--NO QUESTION NAME--'}</Td>
                    <Td>{question.questionType}</Td>
                    <Td>{question.questionAnswer.join(',')}</Td>

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
                    </Td>
                    <Td>
                      <Button
                        onClick={() => {
                          navigate(`/question/${question._id}`);
                        }}
                      >
                        View / Edit
                      </Button>
                      <DeleteButton
                        onClick={() => {
                          deleteQuestionFromQuiz(question);
                        }}
                      >
                        Delete
                      </DeleteButton>
                    </Td>
                  </tr>
                ))}

            </tbody>
          </Table>
        </Section>
      </Content>
    </PageContainer>
  )
}

export default QuizInfo



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