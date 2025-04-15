import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import styled from "styled-components";
import AWS from 'aws-sdk'
import { MoonLoader } from 'react-spinners';


const ChapterInfo = () => {
  const { id } = useParams();

  const [chapter, setChapter] = useState(null);
  // 
  const [videoName, setVideoName] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [videoAccess, setVideoAccess] = useState('PAID');
  const [pdfAccess, setPdAccess] = useState('PAID');
  // 
  const [quizName, setQuizName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate()


  const getChapter = () => {
    fetch(`${process.env.REACT_APP_API_URL}/getChapterById`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ chapterId: id })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.message == 'success') {
          setChapter(data.chapter);
        }
        else {
          toast.error('Error Getting Chapter Details');
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error('Error Getting Chapter Details');
      });
  }
  const updateChapterDetails = () => {
    const { _id, chapterName, chapterDescription } = chapter;

    fetch(`${process.env.REACT_APP_API_URL}/updateChapterById`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ _id, chapterName, chapterDescription })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.message == 'success') {
          toast.success('Chapter Updated Successfully');
          setChapter(data.chapter);
        }
        else {
          toast.error('Error Updating Chapter');
        }
      })
  }
  const addNewVideo = async (file) => {
    if (videoName.length === 0) {
      toast.error('Enter Video Name and Try again!!');
      return;
    }

    setIsLoading(true);

    // Upload the file and get the location
    let fileLocation = await uploadFile(file);

    if (fileLocation) {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/addVideoToChapter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chapterId: id, videoUrl: fileLocation, videoName, access: videoAccess }),
        });

        const data = await res.json();

        console.log(data);

        if (data.message === 'success') {
          toast.success('Video Uploaded Successfully');
          setChapter(data.chapter);
        } else {
          toast.error('Error Uploading Video');
        }
      } catch (error) {
        console.error("Error uploading video:", error);
        toast.error('Error in uploading video');
      }
    }
    else {
      toast.error('Video not uploaded')
    }
    setIsLoading(false);
  };
  const addNewPdf = async (file) => {
    if (pdfName.length === 0) {
      toast.error('Enter Pdf Name and Try again!!');
      return;
    }

    setIsLoading(true);

    try {
      // Upload the PDF file and get the file location
      let fileLocation = await uploadFile(file);

      if (fileLocation) {
        // Send the API request to add the notes
        const res = await fetch(`${process.env.REACT_APP_API_URL}/addNotesToChapter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chapterId: id, notesUrl: fileLocation, notesName: pdfName, access: pdfAccess }),
        });

        const data = await res.json();
        console.log(data);

        if (data.message === 'success') {
          toast.success('Notes Uploaded Successfully');
          setChapter(data.chapter); // Update chapter state with the new data
        } else {
          toast.error('Error Uploading Notes');
        }
      } else {
        toast.error('Pdf not uploaded');
      }
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error('An error occurred while uploading the PDF');
    } finally {
      setIsLoading(false); // Stop loading whether the upload is successful or failed
    }
  };


  const deleteNotes = async (notesUrl, notesName) => {
    fetch(`${process.env.REACT_APP_API_URL}/deletenotesFromChapter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ chapterId: id, notesUrl, notesName })

    })
      .then((res) => res.json())
      .then(async (data) => {

        if (data.message == 'success') {
          await deleteFile(notesUrl);
          setChapter(data.chapter);
          toast.success('Notes Deleted Successfully');
        }
        else {
          toast.error('Error Deleting Notes');
        }
      }
      )
      .catch((error) => {
        console.log(error);
        toast.error("Error in submitting");
      }
      );

  }
  const deleteVideo = async (videoUrl, videoName) => {
    fetch(`${process.env.REACT_APP_API_URL}/deleteVideoFromChapter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ chapterId: id, videoUrl, videoName })

    })
      .then((res) => res.json())
      .then(async (data) => {
        console.log(data);
        if (data.message == 'success') {
          await deleteFile(videoUrl);

          setChapter(data.chapter);
          toast.success('Video Deleted Successfully');

        }
        else {
          toast.error('Error Deleting Video');
        }
      }
      )
      .catch((error) => {
        console.log(error);
        toast.error("Error in submitting");
      }
      );
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
            toast.error('Error in deleting file');
            reject('Error in deleting file');
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

  const addNewQuiz = () => {
    if (quizName.length < 1) {
      return;
    }
    const token = localStorage.getItem('token');

    fetch(process.env.REACT_APP_API_URL + '/createQuizForChapter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,

      },
      body: JSON.stringify({
        chapterQuizName: quizName,
        chapterId: id
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        // console.log(data)
        if (data.message == 'success') {
          toast.success('Quiz Added')
          setChapter(data.chapter)
          setQuizName('')
        }
        else {
          toast.error('Something went wrong')
        }
      }
      )
      .catch((err) => {
        console.log(err)
      })
  }
  const deleteQuizFromChapter = (quizId) => {
    const token = localStorage.getItem('token');

    fetch(process.env.REACT_APP_API_URL + '/deleteQuizFromChapter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        quizId: quizId,
        chapterId: id // Assuming 'id' is the chapterId for which the quiz is to be deleted
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.message === 'Quiz deleted successfully from chapter and database') {
          toast.success('Quiz deleted successfully');
          setChapter(data.chapter); // Update the chapter state with the modified data
        } else {
          toast.error('Error deleting quiz');
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error('Error deleting quiz');
      });
  }

  const handleViewVideo = (videoUrl) => {
    if (videoUrl) {
      window.open(videoUrl, '_blank'); // Opens the video in a new browser tab
    } else {
      alert("Video URL is not available");
    }
  };
  const handleViewPdf = (pdfUrl) => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank'); // Opens the PDF in a new browser tab
    } else {
      alert("PDF URL is not available");
    }
  };

  useEffect(() => {
    getChapter();
  }, [id]);


  if (!chapter) {
    return <Loading>
      <div style={loadingStyle}>
        <MoonLoader size={50} color="#007bff" />
      </div>
    </Loading>;
  }


  if (isLoading) {
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
        <h1>Chapter Info</h1>

        <Section>
          <h2>Basic Details</h2>
          <Table>
            <tbody>
              <tr>
                <Th>Chapter Name</Th>
                <Td>
                  <Input
                    type="text"
                    value={chapter.chapterName}
                    onChange={(e) =>
                      setChapter((prev) => ({ ...prev, chapterName: e.target.value }))
                    }
                  />
                </Td>
              </tr>

              <tr>
                <Th>Chapter Description</Th>
                <Td>
                  <Textarea
                    type="text"
                    value={chapter.chapterDescription}
                    onChange={(e) =>
                      setChapter((prev) => ({ ...prev, chapterDescription: e.target.value }))
                    }
                  />
                </Td>
              </tr>
            </tbody>

          </Table>

          <Button onClick={() => {
            updateChapterDetails()
          }}>Save Info</Button>
        </Section>

        {/* NOTES */}
        <Section>
          <Header>
            <h2>Notes</h2>
          </Header>
        </Section>

        <Section>

          <Table>
            <tr>
              <Th>Enter Notes Name & Access</Th>
              <Td>
                <Input
                  type="text"
                  placeholder='Enter Notes Name'
                  value={pdfName}
                  onChange={(e) =>
                    setPdfName(e.target.value)
                  }
                />
                <br />
                <br />
                <Select
                  value={pdfAccess}
                  onChange={(e) =>
                    setPdAccess(e.target.value)
                  }
                >
                  <Option value="FREE">FREE</Option>
                  <Option value="PAID">PAID</Option>
                </Select>

              </Td>
              <Td>
                <input
                  type="file"
                  id="chapterNote"
                  name="chapterNote"
                  accept="application/pdf"
                  multiple={false}
                  onChange={(e) => {

                    addNewPdf(e.target.files[0]);
                  }}
                  style={{ display: "none" }} // Hide the input
                />
                <Button onClick={() => document.getElementById("chapterNote").click()}>Add Notes</Button></Td>
            </tr>
          </Table>
          <Table>

            <thead>
              <tr>
                <Th>Notes Name</Th>
                <Th>Access</Th>
                <Th>Actions</Th>

              </tr>
            </thead>
            <tbody>
              {chapter.chapterNotes.map((note) => (
                <tr key={note.notesUrl}>
                  <Td>{note.notesName}</Td>
                  <Td>{note.access}</Td>
                  <Td>
                    <Button onClick={() => handleViewPdf(note.notesUrl)}>View PDF</Button>
                    <DeleteButton

                      onClick={() => {
                        deleteNotes(note.notesUrl, note.notesName)
                      }}
                    >Delete</DeleteButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>

        {/* VIDEO */}
        <Section>
          <Header>
            <h2>Video</h2>
          </Header>
        </Section>

        <Section>

          <Table>
            <tr>
              <Th>Enter Video Name & Access</Th>
              <Td>
                <Input
                  type="text"
                  placeholder='Enter Video Name'
                  value={videoName}
                  onChange={(e) =>
                    setVideoName(e.target.value)
                  }
                />
                <br />
                <br />
                <Select
                  value={videoAccess}
                  onChange={(e) =>
                    setVideoAccess(e.target.value)
                  }
                >
                  <Option value="FREE">FREE</Option>
                  <Option value="PAID">PAID</Option>
                </Select>

              </Td>
              <Td>
                <input
                  type="file"
                  id="chapterVideo"
                  name="chapterVideo"
                  accept="video/mp4, video/avi, video/mov, video/mkv, video/webm" // Accept video formats
                  multiple={false}
                  onChange={(e) => {
                    addNewVideo(e.target.files[0]);
                  }}
                  style={{ display: "none" }} // Hide the input
                />

                <Button onClick={() => document.getElementById("chapterVideo").click()}>Add Lecture</Button></Td>
            </tr>
          </Table>
          <Table>

            <thead>
              <tr>
                <Th>Lecture Name</Th>
                <Th>Access</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {chapter.chapterVideos.map((video) => (
                <tr key={video.videoUrl}>
                  <Td>{video.videoName}</Td>
                  <Td>{video.access}</Td>
                  <Td>
                    <Button onClick={() => handleViewVideo(video.videoUrl)}>View Video</Button>


                    <DeleteButton
                      onClick={() => {
                        // deleteVideoFromChapter(video._id, chapter._id)
                        deleteVideo(video.videoUrl, video.videoName)
                      }}
                    >Delete</DeleteButton>

                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>


        {/* QUIZ */}
        <Section>
          <Header>
            <h2>Quizzes</h2>
          </Header>
        </Section>

        <Section>
          <Table>
            <tr>
              <Th>Enter Quiz Name</Th>
              <Td>
                <Input
                  type="text"
                  value={quizName}
                  onChange={(e) =>
                    setQuizName(e.target.value)
                  }
                />
              </Td>
              <Td><Button onClick={() => addNewQuiz()}>Add Quiz</Button></Td>
            </tr>
          </Table>

          <Table>
            <thead>
              <tr>
                <Th>Quiz Id</Th>

                <Th>Quiz Name</Th>

                <Th>Access</Th>
                <Th>Disabled</Th>

                <Th>Actions</Th>

              </tr>
            </thead>
            <tbody>
              {chapter.chapterQuizzes.map((quiz) => (
                <tr key={quiz._id}>
                  <Td>{quiz._id}</Td>

                  <Td>{quiz.chapterQuizName}</Td>
                  <Td>{quiz.access}</Td>
                  <Td>{quiz.disabled || 'false'}</Td>

                  <Td>
                    <Button
                      onClick={() => {
                        navigate(`/quiz/chapter/${quiz._id}`)
                      }}
                    >View</Button>

                    <DeleteButton
                      onClick={() => {
                        deleteQuizFromChapter(quiz._id)
                      }}
                    >Delete</DeleteButton>
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

export default ChapterInfo

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