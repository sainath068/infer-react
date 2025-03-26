// // src/pages/ArticleDerive/FullText.js
// import "./FullText.css";
// const generateFullTextHTML = (fullTextData) => {
//   if (!fullTextData || !fullTextData.body) {
//     return "<p>No content available</p>";
//   }

//   let htmlContent = "";
//   const formatTextWithLinksAndEmails = (text) => {
//     // Step 1: Highlight and make URLs actionable
//     const urlRegex = /(https?:\/\/[^\s]+)/g;
//     let formattedText = text.replace(
//       urlRegex,
//       (url) =>
//         `<a href="${url}" target="_blank" rel="noopener noreferrer" class="highlight-link">${url}</a>`
//     );

//     // Step 2: Highlight and make email IDs actionable
//     const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
//     formattedText = formattedText.replace(
//       emailRegex,
//       (email) =>
//         `<a href="mailto:${email}" class="highlight-email">${email}</a>`
//     );

//     // Step 3: Bold words ending with a colon (outside of URLs and emails to avoid breaking links)
//     // This regex ensures we don't bold colons inside URLs or emails
//     formattedText = formattedText.replace(
//       /(?<!https?:\/\/[^\s]*)(?<!mailto:[^\s]*)\b(\w+):\s/g,
//       '<span class="highlight-colon">$1:</span>'
//     );

//     return formattedText;
//   };

//   fullTextData.body.forEach((section) => {
//     switch (section.type) {
//       case "title":
//         htmlContent += `<h1 style="font-size: 18px; margin-bottom: 5px;">${section.content}</h1>`;
//         break;
//       case "subheading":
//         htmlContent += `<h2 style="font-size: 18px; margin: 10px 0 5px;">${section.content}</h2>`;
//         break;
//       case "subsubheading":
//         htmlContent += `<h3 style="font-size: 18px; margin: 10px 0 5px;">${section.content}</h3>`;
//         break;
//       case "subsubsubheading":
//         htmlContent += `<h4 style="font-size: 16px; margin: 5px 0 0px;">${section.content}</h4>`;
//         break;
//       case "text":
//         if (section.content.trim() !== "") {
//           htmlContent += `<p style=" font-size: 14px;line-height: 1.5;">${section.content}</p>`;
//         }
//         break;
//       case "figure":
//         const figure = section.content;
//         htmlContent += `
//             <figure style="margin: 10px 0;">
//               <img src="${figure.image_url}" alt="${figure.caption}" style="max-width: 100%; height: auto;" />
//               <figcaption style="font-size: 14px; color: #555; margin-top: 5px;">
//                 ${figure.caption}
//                 <br/>
//                 Downloads:
//                 <a href="${figure.downloads.PPT}" target="_blank">PPT</a> |
//                 <a href="${figure.downloads.PNG}" target="_blank">PNG</a> |
//                 <a href="${figure.downloads.TIFF}" target="_blank">TIFF</a>
//               </figcaption>
//             </figure>
//           `;
//         break;
//       case "references":
//         // htmlContent += `<h2 style="font-size: 20px; margin: 10px 0 5px;">References</h2>`;
//         htmlContent += `<ol style="margin-bottom: 5px; padding-left: 20px;">`;
//         section.content.forEach((ref) => {
//           htmlContent += `
//               <li style="margin-bottom: 5px;">
//                 ${ref.citation}
//                 <br/>
//                 ${ref.links
//                   .map(
//                     (link) =>
//                       `<a href="${link.url}" target="_blank">${link.text}</a>`
//                   )
//                   .join(" | ")}
//               </li>
//             `;
//         });
//         htmlContent += `</ol>`;
//         break;
//       case "publication_date":
//         htmlContent += `<p style="font-style: italic; color: #666;">${section.content}</p>`;
//         break;
//       case "doi":
//         htmlContent += `<p><a href="${section.content}" target="_blank">${section.content}</a></p>`;
//         break;
//       default:
//         break;
//     }
//   });
//   return `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600&display=swap" rel="stylesheet" />
//         <title>${
//           fullTextData.body.find((s) => s.type === "title")?.content ||
//           "Full Text"
//         }</title>
//         <style>
//           body {
//             font-family: Manrope, sans-serif;
//             max-width: 800px;
//             margin: 0 auto;
//             padding: 20px;
//             line-height: 1.6;
//             color: #333;
//           }
//           h1, h2, h3, h4 {
//             color: black;
//           }
//           p {
//             margin-bottom: 5px;
//           }
//           a {
//             color: #0071bc;
//             text-decoration: none;
//           }
//           a:hover {
//             text-decoration: underline;
//           }
//           figure {
//             text-align: center;
//           }
//           figcaption {
//             text-align: left;
//           }
//           ol {
//             padding-left: 20px;
//           }
//           .metadata-box {
//             border: 1px solid #ccc;
//             padding: 15px;
//             margin: 10px 0;
//             border-radius: 5px;
//             background-color: #f9f9f9;
//           }
//           .metadata-heading {
//             font-size: 16px;
//             font-weight: bold;
//             color: #333;
//             margin-bottom: 5px;
//             text-transform: uppercase;
//             background-color: #e0e0e0;
//             padding: 5px;
//             border-radius: 3px;
//           }
//           .metadata-content {
//             font-size: 14px;
//             color: #555;
//             line-height: 1.5;
//             margin: 0;
//           }
//           .metadata-division {
//             padding: 5px 0;
//             border-bottom: 1px solid #ddd;
//           }
//           .metadata-division.last-division {
//             border-bottom: none;
//           }
//           .highlight-colon {
//             font-weight: bold;
//             color: #000;
//           }
//         </style>
//       </head>
//       <body>
//         ${htmlContent}
//       </body>
//     </html>
//   `;
// };

// export default generateFullTextHTML;
// src/pages/ArticleDerive/FullText.js

// src/pages/ArticleDerive/FullText.js

const generateFullTextHTML = (fullTextData) => {
  if (!fullTextData || !fullTextData.body) {
    return "<p>No content available</p>";
  }

  let htmlContent = "";

  const formatTextWithLinksAndEmails = (text, isStartOfContent = false) => {
    // Step 1: Highlight and make URLs actionable
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let formattedText = text.replace(
      urlRegex,
      (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="highlight-link">${url}</a>`
    );

    // Step 2: Highlight and make email IDs actionable
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    formattedText = formattedText.replace(
      emailRegex,
      (email) =>
        `<a href="mailto:${email}" class="highlight-email">${email}</a>`
    );

    // Step 3: Bold words ending with a colon only if at the start of content
    if (isStartOfContent) {
      const colonRegex = /^\b(\w+):\s/;
      formattedText = formattedText.replace(
        colonRegex,
        '<span class="highlight-colon">$1:</span> '
      );
    }

    return formattedText;
  };

  fullTextData.body.forEach((section) => {
    const specialSections = [
      "citation",
      "editor",
      "received",
      "copyright",
      "data_availability",
      "funding",
      "competing_interests",
    ];

    if (specialSections.includes(section.type.toLowerCase())) {
      if (!section.content || section.content.trim() === "") return;

      const divisions = section.content
        .split(";")
        .map((item) => item.trim())
        .filter((item) => item);
      const formattedDivisions = divisions.map((division) => {
        return formatTextWithLinksAndEmails(division, true); // Treat each division as start of content
      });

      const divisionContent = formattedDivisions
        .map(
          (division, index) => `
        <div class="metadata-division ${
          index === formattedDivisions.length - 1 ? "last-division" : ""
        }">
          ${division}
        </div>
      `
        )
        .join("");

      htmlContent += `
        <div class="metadata-box">
          <h3 class="metadata-heading">${section.type
            .replace(/_/g, " ")
            .toUpperCase()}:</h3>
          <div class="metadata-content">
            ${divisionContent}
          </div>
        </div>
      `;
    } else {
      switch (section.type) {
        case "title":
          htmlContent += `<h1 style="font-size: 20px; margin-bottom: 10px;">${section.content}</h1>`;
          break;
        case "subheading":
          htmlContent += `<h2 style="font-size: 20px; margin: 10px 0 5px;">${section.content}</h2>`;
          break;
        case "subsubheading":
          htmlContent += `<h3 style="font-size: 18px; margin: 10px 0 5px;">${section.content}</h3>`;
          break;
        case "subsubsubheading":
          htmlContent += `<h4 style="font-size: 16px; margin: 5px 0 0px;">${section.content}</h4>`;
          break;
        case "text":
          if (section.content.trim() !== "") {
            htmlContent += `<p style="margin-bottom: 10px; line-height: 1.6;">${formatTextWithLinksAndEmails(
              section.content,
              true
            )}</p>`;
          }
          break;
        case "figure":
          const figure = section.content;
          htmlContent += `
            <figure style="margin: 10px 0;">
              <img src="${figure.image_url}" alt="${
            figure.caption
          }" style="max-width: 100%; height: auto;" />
              <figcaption style="font-size: 14px; color: #555; margin-top: 5px;">
                ${formatTextWithLinksAndEmails(figure.caption, true)}
                <br/>
                Downloads:
                <a href="${
                  figure.downloads.PPT
                }" target="_blank" class="highlight-link">PPT</a> |
                <a href="${
                  figure.downloads.PNG
                }" target="_blank" class="highlight-link">PNG</a> |
                <a href="${
                  figure.downloads.TIFF
                }" target="_blank" class="highlight-link">TIFF</a>
              </figcaption>
            </figure>
          `;
          break;
        case "references":
          //htmlContent += `<h2 style="font-size: 20px; margin: 10px 0 5px;">References</h2>`;
          htmlContent += `<ol style="margin-bottom: 10px; padding-left: 20px;">`;
          section.content.forEach((ref) => {
            htmlContent += `
              <li style="margin-bottom: 10px;">
                ${formatTextWithLinksAndEmails(ref.citation, true)}
                <br/>
                ${ref.links
                  .map(
                    (link) =>
                      `<a href="${link.url}" target="_blank" class="highlight-link">${link.text}</a>`
                  )
                  .join(" | ")}
              </li>
            `;
          });
          htmlContent += `</ol>`;
          break;
        case "publication_date":
          htmlContent += `<p style="font-style: italic; color: #666;">${formatTextWithLinksAndEmails(
            section.content,
            true
          )}</p>`;
          break;
        case "doi":
          htmlContent += `<p><a href="${section.content}" target="_blank" class="highlight-link">${section.content}</a></p>`;
          break;
        default:
          break;
      }
    }
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600&display=swap" rel="stylesheet" />
        <title>${
          fullTextData.body.find((s) => s.type === "title")?.content ||
          "Full Text"
        }</title>
        <style>
          body {
            font-family: Manrope, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
          }
          h1, h2, h3, h4 {
            color: black;
          }
          p {
            margin-bottom: 10px;
          }
          a {
            color: #0071bc;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .highlight-link {
            color: #1a73e8;
            text-decoration: underline;
            font-weight: bold;
          }
          .highlight-email {
            color: #d32f2f;
            text-decoration: underline;
            font-weight: bold;
          }
          figure {
            text-align: center;
          }
          figcaption {
            text-align: left;
          }
          ol {
            padding-left: 20px;
          }
          .metadata-box {
            border: 1px solid #ccc;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            background-color: #f9f9f9;
          }
          .metadata-heading {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
            text-transform: uppercase;
            background-color: #e0e0e0;
            padding: 5px;
            border-radius: 3px;
          }
          .metadata-content {
            font-size: 14px;
            color: #555;
            line-height: 1.5;
            margin: 0;
          }
          .metadata-division {
            padding: 5px 0;
            border-bottom: 1px solid #ddd;
          }
          .metadata-division.last-division {
            border-bottom: none;
          }
          .highlight-colon {
            font-weight: bold;
            color: #000;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;
};

export default generateFullTextHTML;
