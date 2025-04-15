// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import UserInfo from "./pages/UserInfo";
import AllUsersPage from "./pages/AllUsersPage";
import AllCoursesPage from "./pages/AllCoursesPage";
import CourseInfo from "./pages/CourseInfo";
import AllProductsPage from "./pages/AllProductsPage";
import ProductInfo from "./pages/ProductInfo";
import AddProduct from "./pages/AddProduct";
import AllOrdersPage from "./pages/AllOrders";
import AllBanners from "./pages/AllBanners";
import SubjectInfo from "./pages/SubjectInfo";
import QuizInfo from "./pages/QuizInfo";
import ChapterInfo from "./pages/ChapterInfo";
import QuestionInfo from "./pages/QuestionInfo";
import AddQuestion from "./pages/AddQuestion";
import AllExtras from "./pages/AllExtras";
import EditOrder from "./pages/EditOrder";

const App = () => {
  const isAdminLoggedIn = useSelector((state) => state.auth.isAdminLoggedIn);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AllCoursesPage />
            </ProtectedRoute>
          }
        />
           <Route
          path="/users"
          element={
            <ProtectedRoute>
              <AllUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/allcourses"
          element={
            <ProtectedRoute>
              <AllCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/allproducts"
          element={
            <ProtectedRoute>
              <AllProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/allorders"
          element={
            <ProtectedRoute>
              <AllOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/allbanners"
          element={
            <ProtectedRoute>
              <AllBanners />
            </ProtectedRoute>
          }
        />
         <Route
          path="/allextras"
          element={
            <ProtectedRoute>
              <AllExtras />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/:id"
          element={
            <ProtectedRoute>
              <UserInfo />
            </ProtectedRoute>
          }
        />


        <Route
          path="/course/:id"
          element={
            <ProtectedRoute>
              <CourseInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProtectedRoute>
              <ProductInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subject/:id"
          element={
            <ProtectedRoute>
              <SubjectInfo />
            </ProtectedRoute>
          }
        />
          <Route
          path="/chapter/:id"
          element={
            <ProtectedRoute>
              <ChapterInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:quizType/:id"
          element={
            <ProtectedRoute>
              <QuizInfo />
            </ProtectedRoute>
          }
        />
          <Route
          path="/question/:id"
          element={
            <ProtectedRoute>
              <QuestionInfo />
            </ProtectedRoute>
          }
        />
          <Route
          path="/addquestion/:quiztype/:quizid"
          element={
            <ProtectedRoute>
              <AddQuestion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addproduct"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
        />
         <Route
          path="/order/:id"
          element={
            <ProtectedRoute>
              <EditOrder />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
