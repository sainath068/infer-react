// import React, { useState } from "react";
// import { IoMdOpen } from "react-icons/io";
// import "./ImageViewer.css";

// const ImageViewer = ({ imageUrl, caption, downloads }) => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [zoomLevel, setZoomLevel] = useState(1);
//   console.log("image url", imageUrl);
//   console.log("caption", caption);
//   console.log("downloads", downloads);

//   return (
//     <div className="image-viewer">
//       {/* Thumbnail with zoom button */}
//       <div className="image-wrapper">
//         <img
//           src={imageUrl}
//           alt={caption}
//           className="preview-image"
//           onClick={() => setIsModalOpen(true)}
//         />
//         <button className="zoom-icon" onClick={() => setIsModalOpen(true)}>
//           <IoMdOpen size={24} />
//         </button>
//       </div>

//       {/* Download Links */}
//       {downloads && (
//         <div className="download-links">
//           <span>Download:</span>
//           {downloads.PPT && (
//             <a href={downloads.PPT} target="_blank">
//               PPT
//             </a>
//           )}
//           {downloads.PNG && (
//             <a href={downloads.PNG} target="_blank">
//               PNG
//             </a>
//           )}
//           {downloads.TIFF && (
//             <a href={downloads.TIFF} target="_blank">
//               TIFF
//             </a>
//           )}
//         </div>
//       )}

//       {/* Modal for Zoom */}
//       {isModalOpen && (
//         <div className="image-modal">
//           <div className="modal-content">
//             <img
//               src={imageUrl}
//               alt="Zoomed"
//               style={{ transform: `scale(${zoomLevel})` }}
//             />
//             <button
//               className="close-button"
//               onClick={() => setIsModalOpen(false)}
//             >
//               ✖
//             </button>
//             <div className="zoom-controls">
//               <button onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 3))}>
//                 ➕ Zoom In
//               </button>
//               <button onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 1))}>
//                 ➖ Zoom Out
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ImageViewer;
