import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import styled from "styled-components";

const SubjectInfo = () => {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [chapterName, setChapterName] = useState('');
  const [quizName, setQuizName] = useState('');
  const navigate = useNavigate()

  const getChaptersFromSubject = () => {
    fetch(`${process.env.REACT_APP_API_URL}/getSubjectBySubjectId`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subjectId: id })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('chapters ',data);
        if (data.message == 'success') {
          setSubject(data.subject)
        }
        else {
          toast.error('Error Getting Chapters');
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error('Error Getting Chapters');
      }
      )
  }

  useEffect(() => {
    getChaptersFromSubject();
  }, [id])


 
  const updateSubjectDetails = () => {
    const { _id, subjectName } = subject;

    fetch(`${process.env.REACT_APP_API_URL}/updateSubjectById`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ _id, subjectName })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.message == 'success') {
          toast.success('Chapter Updated Successfully');
          setSubject(data.subject);
        }
        else {
          toast.error('Error Updating Chapter');
        }
      })
  }
  const addNewChapter = () => {
    if (chapterName.length < 1) {
      return;
    }
    const token = localStorage.getItem('token');

    fetch(process.env.REACT_APP_API_URL + '/addChapterToSubject', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,

      },
      body: JSON.stringify({
        chapterName: chapterName,
        subjectId: id
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        if (data.message == 'success') {
          toast.success('Chapter Added')
          setSubject(data.subject)
          setChapterName('')
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

  const deleteChapterFromSubject = (chapterId) => {
    const token = localStorage.getItem('token');

    fetch(process.env.REACT_APP_API_URL + '/deleteChapterFromSubject', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            chapterId: chapterId,
            subjectId: id // Assuming 'id' is the subjectId for which the chapter is to be deleted
        }),
    })
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
        if (data.message === 'Chapter deleted successfully from subject and database') {
            toast.success('Chapter deleted successfully');
            setSubject(data.subject); // Update the subject state with the modified data
        } else {
            toast.error('Error deleting chapter');
        }
    })
    .catch((err) => {
        console.log(err);
        toast.error('Error deleting chapter');
    });
}


  const addNewQuiz = () => {
    if (quizName.length < 1) {
      return;
    }
    const token = localStorage.getItem('token');

    fetch(process.env.REACT_APP_API_URL + '/createQuizForSubject', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,

      },
      body: JSON.stringify({
        subjectQuizName: quizName,
        subjectId: id
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        if (data.message == 'success') {
          toast.success('Quiz Added')
          setSubject(data.subject)
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


  const deleteQuizFromSubject = (quizId) => {
    const token = localStorage.getItem('token');

    fetch(process.env.REACT_APP_API_URL + '/deleteQuizFromSubject', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        quizId: quizId,
        subjectId: id // Assuming 'id' is the subjectId for which the quiz is to be deleted
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.message === 'Quiz deleted successfully from subject and database') {
          toast.success('Quiz deleted successfully');
          setSubject(data.subject); // Update the subject state with the modified data
        } else {
          toast.error('Error deleting quiz');
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error('Error deleting quiz');
      });
  }


  if (!subject) {
    return <Loading>Loading subject details...</Loading>;
  }
  return (
    <PageContainer>
      <BackButton onClick={() => navigate(-1)}>← Back</BackButton>
      <Content>
        <h1>Subject Info</h1>
        <Section>
          <h2>Basic Details</h2>
          <Table>
            <tbody>
              <tr>
                <Th>Subject Name</Th>
                <Td>
                  <Input
                    type="text"
                    value={subject.subjectName}
                    onChange={(e) =>
                      setSubject((prev) => ({ ...prev, subjectName: e.target.value }))
                    }
                  />
                </Td>
              </tr>
            </tbody>

          </Table>

          <Button onClick={() => {
            updateSubjectDetails()
          }}>Save Info</Button>
        </Section>

        <Section>
          <Header>
            <h2>Chapter</h2>

          </Header>
        </Section>

        <Section>

          <Table>
            <tr>
              <Th>Enter Chapter Name</Th>
              <Td>
                <Input
                  type="text"
                  value={chapterName}
                  onChange={(e) =>
                    setChapterName(e.target.value)
                  }
                />
              </Td>
              <Td><Button onClick={() => addNewChapter()}>Add Chapter</Button></Td>
            </tr>
          </Table>

          <Table>

            <thead>
              <tr>
                <Th>Chapter Name</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {subject.subjectChapters.map((chapter) => (
                <tr key={subject._id}>
                  <Td>{chapter.chapterName}</Td>
                  <Td>
                    <Button
                      onClick={() => {
                        navigate(`/chapter/${chapter._id}`)
                      }}
                    >View</Button>
                    {' '}
                    <DeleteButton
                      onClick={() => {
                        deleteChapterFromSubject(chapter._id)
                      }}
                    >Delete</DeleteButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>


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
                <Th>Quiz id</Th>

                <Th>Quiz Name</Th>
                <Th>Access</Th>
                <Th>Disabled</Th>

                <Th>Actions</Th>

              </tr>
            </thead>
            <tbody>
              {subject.subjectQuizzes.map((quiz) => (
                <tr key={quiz._id}>
                  <Td>{quiz._id}</Td>

                  <Td>{quiz.subjectQuizName}</Td>
                  <Td>{quiz.access || 'PAID'}</Td>
                  <Td>{quiz.disabled || 'false'}</Td>

                  <Td>
                    <Button
                      onClick={() => {
                        navigate(`/quiz/subject/${quiz._id}`)
                      }}
                    >View</Button>
                    {' '}
                    <DeleteButton
                      onClick={() => {
                        deleteQuizFromSubject(quiz._id)
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

export default SubjectInfo




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

const DeleteButton = styled.button`
    margin-bottom: 20px;
    padding: 10px 20px;
    background-color: red;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background-color: grey;
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

  &:hover {
    background-color: #218838;
  }
`;
