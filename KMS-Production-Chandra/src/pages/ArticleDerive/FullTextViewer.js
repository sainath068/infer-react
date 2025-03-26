import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import "./FullText.css";
import Loading from "../../components/Loading";

const FullTextViewer = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  //const [loading, setLoading] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);
  const endOfMessagesRef = useRef(null);
  const isStreamDoneRef = useRef(false);
  //const { pmid } = useParams();
  const { user } = useSelector((state) => state.auth);
  //const token = useSelector((state) => state.auth.access_token);
  const user_id = user?.user_id;

  const handleAskClick = async () => {
    if (!query) return;

    setLoading(true);
    isStreamDoneRef.current = false;

    const newChat = { query, response: "", showDot: true };
    setChatHistory((prev) => [...prev, newChat]);

    const bodyData = {
      question: query,
      data: fullTextData.body, // pass fullTextData directly
      source,
      user_id: user_id, // or get from user context
    };
    try {
      const response = await fetch(
        "https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/generate-answer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        }
      );

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      setQuery("");

      const readStream = async () => {
        while (true) {
          if (isStreamDoneRef.current) break;
          const { value, done } = await reader.read();
          if (done) break;

          if (value) {
            buffer += decoder.decode(value, { stream: true });

            while (buffer.includes("{") && buffer.includes("}")) {
              const start = buffer.indexOf("{");
              const end = buffer.indexOf("}") + 1;
              const chunk = buffer.slice(start, end);
              buffer = buffer.slice(end);

              try {
                const parsed = JSON.parse(chunk);
                const answer = parsed.answer;

                for (let i = 0; i < answer.length; i += 10) {
                  const chunkPiece = answer.slice(i, i + 10);
                  setChatHistory((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1].response += chunkPiece;
                    return updated;
                  });

                  await new Promise((r) => setTimeout(r, 0));
                }
              } catch (err) {
                console.error("JSON parse error:", err);
              }
            }
          }
        }

        setLoading(false);
      };

      readStream();
    } catch (err) {
      console.error("Stream fetch error:", err);
      setLoading(false);
    }
  };

  // Extract URL and Source from Query Parameters
  const fullTextUrl = searchParams.get("url")
    ? decodeURIComponent(searchParams.get("url"))
    : "";
  const source = searchParams.get("source")
    ? decodeURIComponent(searchParams.get("source"))
    : "";
  const Lsource = source.toLowerCase();

  const [fullTextData, setFullTextData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return; // Prevent duplicate API calls
    hasFetched.current = true;
    if (!fullTextUrl || !source) {
      setError("Invalid URL or Source missing.");
      setLoading(false);
      return;
    }
    console.log("API Call Triggered:", { fullTextUrl, source });

    const fetchFullText = async () => {
      try {
        const requestUrl = `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/full_text?source=${Lsource}&url=${fullTextUrl}`;
        const response = await axios.get(requestUrl);
        console.log("API Response:", response.data);
        if (response.data && Array.isArray(response.data.body)) {
          setFullTextData(response.data);
        } else {
          throw new Error("Invalid data received");
        }
      } catch (err) {
        setError("Failed to fetch full text. " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFullText();
  }, [fullTextUrl, source]);

  if (loading) return <Loading />;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // 🔄 Generate the Full HTML Page for Display
  const generateFullTextHTML = (fullTextData) => {
    if (!fullTextData || !fullTextData.body) {
      return "<p>No content available</p>";
    }

    let htmlContent = "";

    const formatTextWithLinksAndEmails = (text) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      let formattedText = text.replace(
        urlRegex,
        (url) =>
          `<a href="${url}" target="_blank" class="highlight-link">${url}</a>`
      );

      const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
      formattedText = formattedText.replace(
        emailRegex,
        (email) =>
          `<a href="mailto:${email}" class="highlight-email">${email}</a>`
      );
      //   if (isStartOfContent) {
      //     const colonRegex = /^\b(\w+):\s/;
      //     formattedText = formattedText.replace(
      //       colonRegex,
      //       '<span class="highlight-colon">$1:</span> '
      //     );
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
            <div class="metadata-division  ${
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
            htmlContent += `<h1 style="font-size: 20px; margin-bottom: 10px; text-align:start">${section.content}</h1>`;
            break;
          case "subheading":
            htmlContent += `<h2 style="font-size: 20px; margin: 10px 0 5px;text-align:start">${section.content}</h2>`;
            break;
          case "subsubheading":
            htmlContent += `<h3 style="font-size: 18px; margin: 10px 0 5px;text-align:start">${section.content}</h3>`;
            break;
          case "subsubsubheading":
            htmlContent += `<h4 style="font-size: 16px; margin: 5px 0 0px;text-align:start">${section.content}</h4>`;
            break;
          case "text":
            if (
              section.content.startsWith("Citation:") ||
              section.content.startsWith("Editor:") ||
              section.content.startsWith("Received:") ||
              section.content.startsWith("Published:") ||
              section.content.startsWith("Accepted:") ||
              section.content.startsWith("Copyright:") ||
              section.content.startsWith("Data Availability:") ||
              section.content.startsWith("Funding:") ||
              section.content.startsWith("Competing interests:")
            ) {
              const parts = section.content.split(":");
              htmlContent += `
                <div style="border-bottom: 1px solid #ddd; padding: 10px; margin-bottom: 5px;border: 1px solid #ddd;text-align:start">
                  <strong style="color: black;">${parts[0]}:</strong> ${parts
                .slice(1)
                .join(":")
                .trim()}
                </div>
              `;
            } else {
              htmlContent += `<p style="margin-bottom: 10px; line-height: 1.6;text-align:start">${formatTextWithLinksAndEmails(
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
          case "table":
            if (section.content.rows.length > 0) {
              htmlContent += `<table border="1" style="width:100%; border-collapse: collapse;">`;
              section.content.rows.forEach((row, index) => {
                if (index === 0) {
                  htmlContent += `<tr style="color: white;">`;
                  row.forEach((cell) => {
                    htmlContent += `<th style="padding: 8px;">${cell}</th>`;
                  });
                  htmlContent += `</tr>`;
                } else {
                  htmlContent += `<tr>`;
                  row.forEach((cell) => {
                    htmlContent += `<td style="padding: 8px; border: 1px solid #ddd;">${cell}</td>`;
                  });
                  htmlContent += `</tr>`;
                }
              });
              htmlContent += `</table>`;
            }
            break;
          case "image":
            htmlContent += `
                <figure style="text-align: center; margin: 15px 0;">
                  <img src="${section.content.url}" alt="${
              section.content.caption
            }" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />
                  <figcaption style="margin-top: 5px; font-size: 14px; color: #666;">${
                    section.content.caption
                  }</figcaption>
                  ${
                    section.content.downloads
                      ? `<div style="margin-top: 5px;">
                        <a href="${section.content.downloads}" download target="_blank" >Download Image</a>
                      </div>`
                      : ""
                  }
                </figure>`;
            break;
          case "references":
            htmlContent += `<ol style="margin-bottom: 10px; padding-left: 20px;">`;
            section.content.forEach((ref) => {
              htmlContent += `
                  <li style="margin-bottom: 10px;text-align:start; line-break: anywhere;">
                    ${formatTextWithLinksAndEmails(ref.citation, true)}
                    ${
                      ref.links &&
                      Array.isArray(ref.links) &&
                      ref.links.length > 0
                        ? " | " +
                          ref.links
                            .map(
                              (link) =>
                                `<a href="${
                                  link.url
                                }" target="_blank" class="highlight-link">${
                                  link.text || link.source
                                }</a>`
                            )
                            .join(" | ")
                        : ""
                    }
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

    return htmlContent;
  };

  return (
    <div className="full-text-container">
      {/* Render the Full Text HTML Directly */}
      <div
        className="full-text-content"
        dangerouslySetInnerHTML={{ __html: generateFullTextHTML(fullTextData) }}
      />
      <div className="streaming-section">
        {chatHistory.map((chat, index) => (
          <div key={index}>
            <div className="query-asked">{chat.query}</div>
            <div className="response">{chat.response}</div>
          </div>
        ))}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="stream-input">
        <input
          type="text"
          placeholder="Ask something about this article..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAskClick()}
        />
        <button
          onClick={handleAskClick}
          disabled={!query || loading}
          style={{
            marginLeft: "10px",
            cursor: query && !loading ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>
    </div>
  );
};

export default FullTextViewer;
