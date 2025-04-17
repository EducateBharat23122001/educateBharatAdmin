import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Navbar from "../components/Navbar"; // Import the Navbar component
import toast from "react-hot-toast";

const AllCoursesPage = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [courses, setCourses] = useState([])
    const [filteredCourses, setFilteredCourses] = useState([]);

    const [courseName, setCourseName] = useState('');
    // Fetch all courses
    const getAllCourses = () => {
      console.log(`${process.env.REACT_APP_API_URL}/allcourses`)
        fetch(`${process.env.REACT_APP_API_URL}/allcourses`, {
            method: 'POST',
        })
            .then((res) => res.json())
            .then((data) => {
                setCourses(data.courses)
                setFilteredCourses(data.courses);
            })
    }

    // Handle search for courses
    const handleSearch = (searchQuery) => {
        setSearch(searchQuery);
        if (!searchQuery.trim()) {
            setFilteredCourses(courses); // Reset to all courses if search is empty
            return;
        }

        const filtered = courses.filter(course =>
            course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course._id.toLowerCase().includes(searchQuery.toLowerCase()) // Search by ID
        );

        setFilteredCourses(filtered); // Set filtered courses
    };


    useEffect(() => {
        getAllCourses()
    }, [])

    // Navigate to a specific course page
    const handleViewCourse = (id) => {
        navigate(`/course/${id}`);
    };

    // Handle the search input change
    const handleSearchInputChange = (e) => {
        const query = e.target.value;
        setSearch(query);
        handleSearch(query);
    };


    const addNewCourse = () => {
        if (courseName.length < 1) {
            return;
          }
          fetch(process.env.REACT_APP_API_URL + '/addCourse', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                courseName: courseName
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log(data)
              if (data.message == 'Course added successfully') {
                toast.success('Course added successfully')
                setCourseName('')
                navigate(`/course/${data.course._id}`);
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
    return (
        <PageContainer>
            {/* Use Navbar here */}
            <Navbar active={'courses'} />

            {/* Content */}
            <Content>
                <h1>Add New Course</h1>
                <Table>
                    <tr>
                        <Th>Enter Course Name</Th>
                        <Td>
                            <Input
                                type="text"
                                value={courseName}
                                onChange={(e) =>
                                    setCourseName(e.target.value)
                                }
                                placeholder="Enter Course Name"
                            />
                        </Td>
                        <Td><ViewButton onClick={() => addNewCourse()}>Add Course</ViewButton></Td>
                    </tr>
                </Table>
                <h1>All Courses</h1>
                <br />

                <SearchBar
                    type="text"
                    placeholder="Search courses by name or full id..."
                    value={search}
                    onChange={handleSearchInputChange}
                />


                <Table>
                    <thead>
                        <tr>
                            <Th>ID</Th>
                            <Th>Name</Th>
                            <Th>Category</Th>
                            <Th>Price</Th>
                            <Th>Discount</Th>

                            <Th>Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCourses.map((course) => (
                            <tr key={course._id}>
                                <Td>{course._id}</Td>
                                <Td>{course.courseName}</Td>
                                <Td>{course.courseCategory || "N/A"}</Td>
                                <Td>{course.coursePrice || "N/A"}</Td>
                                <Td>{course.courseDiscount}</Td>

                                <Td>
                                    <ViewButton onClick={() => handleViewCourse(course._id)}>
                                        View Course
                                    </ViewButton>
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Content>
        </PageContainer>
    );
};

export default AllCoursesPage;

// Styled Components
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Content = styled.div`
  padding: 20px;
  flex: 1;
  overflow-y: auto;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const Th = styled.th`
  text-align: left;
  padding: 10px;
  border-bottom: 1px solid #ddd;
`;

const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ddd;
`;
const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
`;

const ViewButton = styled.button`
  padding: 5px 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #218838;
  }
`;
