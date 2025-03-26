import React, { useState, useEffect, useRef } from "react";
import "./GenerateAnnotate.css";
import uploadLogo from "../assets/images/uploadDocx.svg";
import { IoCloseOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import Annotation from "./DeriveAnnotations";
import Loading from "./Loading";
import pdfICon from "../assets/images/pdf.png";
import docxIcon from "../assets/images/docx-file.png";
import txtIcon from "../assets/images/txt-file.png";
import { apiService } from "../assets/api/apiService";
const GenerateAnnotate = ({ handleCloseAnnotate }) => {
  const token = useSelector((state) => state.auth.access_token);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [annotateData, setAnnotateData] = useState([]);

  const [annotateLoading, setAnnotateLoading] = useState(false);

  // Ref for the file input element
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (annotateLoading) {
      document.body.style.overflow = "hidden"; // Prevent scrolling
    } else {
      document.body.style.overflow = "auto"; // Enable scrolling
    }

    return () => {
      document.body.style.overflow = "auto"; // Cleanup on unmount
    };
  }, [annotateLoading]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click(); // Trigger file input click
  };

  const handleGenerate = async () => {
    if (!uploadedFile) {
      alert("Please upload a file before generating annotations.");
      return;
    }
    setAnnotateLoading(true);
    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const response = await apiService.annotateFile(formData);

      if (response.status === 200) {
        
        const result = await response.data;
        setAnnotateData(result);
        
        setAnnotateLoading(false);
      } else {
        setAnnotateLoading(false);
        console.error("Failed to generate annotations:", response.statusText);
      }
    } catch (error) {
      setAnnotateLoading(false);
      console.error("Error generating annotations:", error);
    }
  };
  const getFileIcon = (filename) => {
    const fileExtension = filename.split(".").pop().toLowerCase();
    switch (fileExtension) {
      case "pdf":
        return (
          <img
            src={pdfICon}
            alt="pdf-icon"
            style={{ width: "25px", height: "25px" }}
          />
        );
      case "docx":
        return (
          <img
            src={docxIcon}
            alt="pdf-icon"
            style={{ width: "25px", height: "25px" }}
          />
        );
      case "txt":
        return (
          <img
            src={txtIcon}
            alt="pdf-icon"
            style={{ width: "25px", height: "25px" }}
          />
        );
      default:
        return <span style={{ fontSize: "20px" }}>📄</span>;
    }
  };
  return (
    <>
      <div className="generate-annotate-container">
        {annotateLoading ? <Loading /> : ""}
        <div className="generate-annotate-file-upload">
          <h3>Generate Annotations</h3>
          <div className="upload-file" onClick={triggerFileUpload}>
            {uploadedFile ? (
              <div className="uploaded-file-info">
                {getFileIcon(uploadedFile.name)}
                <p>{uploadedFile.name}</p> {/* Display uploaded file name */}
              </div>
            ) : (
              <>
                <img src={uploadLogo} alt="upload-logo" />
                <span>Upload File</span>
              </>
            )}
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              ref={fileInputRef} // Attach ref to input
              style={{ display: "none" }} // Hide the input
            />
          </div>
          <div className="annotates-buttons">
            <button
              className="start-new"
              onClick={() => {
                setUploadedFile(null);
                setAnnotateData([]);
                if (fileInputRef.current) {
                  fileInputRef.current.value = ""; // Reset input value
                }
              }}
            >
              Start New
            </button>
            <button
              className="generate-button"
              disabled={!uploadedFile}
              style={{
                background: !uploadedFile ? "rgba(234, 234, 236, 1)" : "",
                color: !uploadedFile ? "rgba(78, 78, 86, 1)" : "",
                cursor: !uploadedFile ? "not-allowed" : "pointer",
              }}
              onClick={handleGenerate}
            >
              Generate
            </button>
          </div>
        </div>

        {/* Conditional Rendering for Annotations */}
        <div className="annotate-annotations">
          <Annotation annotateData={annotateData} />
        </div>
      </div>

      <button
        className="generate-close-collection"
        onClick={handleCloseAnnotate}
      >
        <IoCloseOutline size={30} color="black" />
      </button>
    </>
  );
};

export default GenerateAnnotate;
