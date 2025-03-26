// import React, { useState } from "react";
// //import "./ImageZoomModal.css";

// const ImageZoomModal = ({ imageUrl, onClose }) => {
//   const [zoomLevel, setZoomLevel] = useState(1);
//   console.log("image url", imageUrl);

//   return (
//     <div className="zoom-overlay" onClick={onClose}>
//       <div className="zoom-container" onClick={(e) => e.stopPropagation()}>
//         <img
//           src={imageUrl}
//           alt="Zoomed View"
//           className="zoomed-image"
//           style={{ transform: `scale(${zoomLevel})` }}
//         />
//         <button className="close-button" onClick={onClose}>
//           ✖
//         </button>
//         <div className="zoom-controls">
//           <button onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 3))}>
//             ➕ Zoom In
//           </button>
//           <button onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 1))}>
//             ➖ Zoom Out
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ImageZoomModal;
