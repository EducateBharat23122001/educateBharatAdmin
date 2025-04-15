import React, { useState } from "react";

const MultiPdfUpload = ({ quiz }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Handle file input change
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  // Save PDFs for each question
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

  return (
    <div>
      <h2>Upload PDFs for Questions</h2>
      <input
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleFileChange}
      />
      <button onClick={handleSavePdfs}>Upload PDFs</button>
    </div>
  );
};

export default MultiPdfUpload;
