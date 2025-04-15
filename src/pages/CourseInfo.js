// src/pages/CourseInfo.js
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import AWS from 'aws-sdk'

const CourseInfo = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [quizName, setQuizName] = useState('');
  const navigate = useNavigate()

  const [userId, setUserId] = useState('');
  const [accessYears, setAccessYears] = useState('1')

  const [isLoading, setIsLoading] = useState(false);
  const getCourseByid = async () => {
    setIsLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/coursebycourseid`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId: id }),
    })
      .then((res) => res.json())
      .then((data) => {

        setCourse(data.course);
      })
      .catch((err) => console.error(err));

    setIsLoading(false);

  };

  useEffect(() => {
    getCourseByid();
  }, [id]);


  const deleteCourseById = async (id) => {
    setIsLoading(true); // Show loading state

    fetch(`${process.env.REACT_APP_API_URL}/deletecoursebyid`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId: id }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete course");
        }
        return res.json();
      })
      .then((data) => {
        console.log(data.message); // Log success message
        toast.success('Course deleted successfully')
        navigate(-1)
        // Add any additional actions (e.g., refresh the course list)
      })
      .catch((err) => {
        console.error(err);
        alert("Error deleting course. Please try again.");
      })
      .finally(() => {
        setIsLoading(false); // Hide loading state
      });
  };

  const saveeditedcoursebyid = async (file) => {
    // name, price , description, image

    AWS.config.update({
      accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
      region: process.env.REACT_APP_AWS_REGION
    });

    console.log(file);

    if (file) {
      setIsLoading(true)
      const s3 = new AWS.S3();
      const params = {
        Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
        Key: file.name,
        Body: file,
        ACL: 'public-read' // Set the appropriate ACL for your use case
      };

      s3.upload(params, (err, data) => {
        setIsLoading(false)
        if (err) {
          console.error('Error uploading file:', err);
          toast.error("Error in uploading image");
        } else {
          console.log('File uploaded successfully:', data.Location);
          // Perform any additional actions after successful upload

          // return data.Location;
          updatecourse(data.Location);

        }
      });
    }
    else {
      updatecourse(course.courseImage)
    }
  }

  const updatecourse = (imagepath) => {
    const { _id, courseName, coursePrice, courseDescription, courseCategory, courseRating, disabled, courseDiscount } = course
    const token = localStorage.getItem('token');

    setIsLoading(true)
    fetch(process.env.REACT_APP_API_URL + '/saveeditedcoursebyid', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,

      },
      body: JSON.stringify({ _id, courseName, coursePrice, courseDescription, courseCategory, courseImage: imagepath, courseRating, disabled, courseDiscount }),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsLoading(false)
        console.log(data)
        if (data.message) {
          toast.success(data.message)
          if (data.course) setCourse(data.course);
        }
        else {
          toast.error('Something went wrong')
        }
      })
      .catch((err) => {
        setIsLoading(false)
        console.log(err)
      })
  }

  const addNewSubject = () => {
    if (subjectName.length < 1) {
      return;
    }
    const token = localStorage.getItem('token');

    fetch(process.env.REACT_APP_API_URL + '/addSubjectToCourse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,

      },
      body: JSON.stringify({
        subjectName: subjectName,
        courseId: id
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        if (data.message == 'success') {
          toast.success('Subject Added')
          setCourse(data.course)
          setSubjectName('')
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

  const deleteSubjectFromCourse = (subjectId, courseId) => {
    const token = localStorage.getItem('token');

    fetch(process.env.REACT_APP_API_URL + '/deleteSubjectFromCourse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        subjectId: subjectId,
        courseId: courseId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === 'success') {
          toast.success('Subject Deleted Successfully');
          // Update course state or UI
          setCourse(data.course);
        } else {
          toast.error('Error Deleting Subject');
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Error Deleting Subject');
      });
  };

  const addNewQuiz = () => {
    if (quizName.length < 1) {
      return;
    }
    const token = localStorage.getItem('token');

    fetch(process.env.REACT_APP_API_URL + '/createQuizForCourse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,

      },
      body: JSON.stringify({
        courseQuizName: quizName,
        courseId: id
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        if (data.message == 'success') {
          toast.success('Quiz Added')
          setCourse(data.course)
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

  const deleteQuizFromCourse = (quizId) => {
    if (!quizId) {
      return;
    }

    const token = localStorage.getItem('token');

    fetch(process.env.REACT_APP_API_URL + '/deleteQuizFromCourse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        quizId: quizId,
        courseId: id, // Assuming 'id' is the course ID available in your component
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.message === 'Quiz deleted successfully from course and database') {
          toast.success('Quiz Deleted');
          setCourse(data.course); // Update course state with the updated course data
        } else {
          toast.error('Error deleting quiz');
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error('Error deleting quiz');
      });
  };

  const giveCourseAccess = () => {
    fetch(process.env.REACT_APP_API_URL + '/giveCourseAccess', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessYears: accessYears,
        courseId: id, // Assuming 'id' is the course ID available in your component
        userId: userId
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        toast.success(data.message)
      })
  }

  if (!course) {
    return <Loading>Loading course details...</Loading>;
  }

  return (
    <PageContainer>
      <BackButton onClick={() => navigate(-1)}>← Back</BackButton>

      <Content>
        <h1>Course Info</h1>

        <Header>
          <img src={course.courseImage} alt={course.courseName} />
          <input
            type="file"
            id="courseImage"
            name="courseImage"
            accept="image/jpeg, image/png"
            multiple={false}
            onChange={(e) => {

              saveeditedcoursebyid(e.target.files[0])
            }}
            style={{ display: "none" }} // Hide the input
          />
          <button
            onClick={() => document.getElementById("courseImage").click()} // Trigger the input
          >
            Add New Image
          </button>
        </Header>

        <Section>
          <h2>Basic Details</h2>
          <Table>
            <tbody>
              <tr>
                <Th>Course Name</Th>
                <Td>
                  <Input
                    type="text"
                    value={course.courseName}
                    onChange={(e) =>
                      setCourse((prev) => ({ ...prev, courseName: e.target.value }))
                    }
                  />
                </Td>
              </tr>
              <tr>
                <Th>Course Id</Th>
                <Td>
                  <Input
                    type="text"
                    value={course._id}
                    disabled
                  />
                </Td>
              </tr>
              <tr>
                <Th>Course Description</Th>
                <Td>
                  <Textarea
                    value={course.courseDescription}
                    onChange={(e) =>
                      setCourse((prev) => ({ ...prev, courseDescription: e.target.value }))
                    }
                  ></Textarea>
                </Td>
              </tr>

              <tr>
                <Th>Course Category</Th>
                <Td>
                  <Select
                    value={course.courseCategory}
                    onChange={(e) =>
                      setCourse((prev) => ({ ...prev, courseCategory: e.target.value }))
                    }
                  >
                    <Option value="FREE">FREE</Option>
                    <Option value="PAID">PAID</Option>
                  </Select>

                </Td>
              </tr>
              <tr>
                <Th>
                  Course Price ({course.coursePriceCurrency})
                </Th>
                <Td>
                  <Input
                    type="text"
                    value={course.coursePrice}
                    onChange={(e) =>
                      setCourse((prev) => ({ ...prev, coursePrice: e.target.value }))
                    }
                  />
                </Td>
              </tr>
              <tr>
                <Th>Course Discount %</Th>
                <Td>
                  <Input
                    type="number"
                    value={course.courseDiscount}
                    onChange={(e) =>
                      setCourse((prev) => ({ ...prev, courseDiscount: e.target.value }))
                    }
                  />
                </Td>
              </tr>
              <tr>
                <Th>Rating out of 5</Th>
                <Td>
                  <Input
                    type="text"
                    value={course.courseRating}
                    onChange={(e) =>
                      setCourse((prev) => ({ ...prev, courseRating: e.target.value }))
                    }
                  />
                </Td>
              </tr>

              <tr>
                <Th>Course Disabled</Th>
                <Td>
                  <Select
                    value={course.disabled}
                    onChange={(e) =>
                      setCourse((prev) => ({ ...prev, disabled: e.target.value }))
                    }
                  >
                    <Option value={false}>FALSE</Option>
                    <Option value={true}>TRUE</Option>
                  </Select>

                </Td>
              </tr>
            </tbody>
          </Table>
          <Button onClick={() => {
            saveeditedcoursebyid()
          }}>Save Info</Button>
        </Section>

        <Section>
          <Header>
            <h2>Give course access</h2>
          </Header>

          <Table>
            <tr>
              <Th>Enter User Id</Th>
              <Td>
                <Input
                  type="text"
                  value={userId}
                  onChange={(e) =>
                    setUserId(e.target.value)
                  }
                />
              </Td>
            </tr>
            <tr>
              <Th>Select Access Years</Th>
              <Td>
                <Select
                  value={accessYears}
                  onChange={(e) =>
                    setAccessYears(e.target.value)
                  }
                >
                  <Option value="1">1</Option>
                  <Option value="2">2</Option>
                  <Option value="3">3</Option>
                  <Option value="3">4</Option>
                </Select>

              </Td>
              <Td><Button onClick={() => giveCourseAccess()}>Add Access</Button></Td>
            </tr>
          </Table>
        </Section>
        <Section>
          <Header>
            <h2>Subjects</h2>

          </Header>


          <Table>
            <tr>
              <Th>Enter Subject Name</Th>
              <Td>
                <Input
                  type="text"
                  value={subjectName}
                  onChange={(e) =>
                    setSubjectName(e.target.value)
                  }
                />
              </Td>
              <Td><Button onClick={() => addNewSubject()}>Add Subject</Button></Td>
            </tr>
          </Table>
          <Table>

            <thead>
              <tr>
                <Th>Subject Name</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {course.courseSubjects.map((subject) => (
                <tr key={subject._id}>
                  <Td>{subject.subjectName}</Td>
                  <Td>
                    <Button
                      onClick={() => {
                        navigate(`/subject/${subject._id}`)
                      }}
                    >View</Button>
                    {' '}
                    <DeleteButton
                      onClick={() => {
                        deleteSubjectFromCourse(subject._id, id)
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
              {course.courseQuizzes.map((quiz) => (
                <tr key={quiz._id}>
                  <Td>{quiz._id}</Td>

                  <Td>{quiz.courseQuizName}</Td>
                  <Td>{quiz.access}</Td>
                  <Td>{quiz.disabled || 'false'}</Td>

                  <Td>
                    <Button
                      onClick={() => {
                        navigate(`/quiz/course/${quiz._id}`)
                      }}
                    >View</Button>
                    {' '}
                    <DeleteButton
                      onClick={() => {
                        deleteQuizFromCourse(quiz._id)
                      }}
                    >Delete</DeleteButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>
      </Content>

      <DeleteButton onClick={() => deleteCourseById(id)}>← Delete Course Permanently</DeleteButton>
    </PageContainer>
  );
};

export default CourseInfo;

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
