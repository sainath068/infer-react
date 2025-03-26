import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useParams, useLocation, Link } from "react-router-dom";
import "../ArticlePage/ArticlePage.css";
import { IoCloseOutline } from "react-icons/io5";
import flag from "../../assets/images/flash.svg";
import Arrow from "../../assets/images/back-arrow.svg";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { CircularProgress } from "@mui/material";
import { faBookmark as regularBookmark } from "@fortawesome/free-regular-svg-icons";
import { faBookmark as solidBookmark } from "@fortawesome/free-solid-svg-icons";
import rehypeRaw from "rehype-raw";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
import { LiaTelegramPlane } from "react-icons/lia";
import { showErrorToast, showSuccessToast } from "../../utils/toastHelper";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import Loading from "../../components/Loading";

const ArticleContent = ({
  setRefreshSessions,
  openAnnotate,
  openNotes,
  setOpenNotes,
  setSavedText,
  annotateLoading,
  setAnnotateLoading,
  isStreamDone,
  setIsStreamDone,
  isStreamDoneRef,
  setClickedBack,
  setActiveSessionId,
  isModalOpen,
  setIsModalOpen,
  fullTextData,
  setFullTextData,
}) => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  //Constants
  const displayMessage = isLoggedIn
    ? ""
    : "This feature is available for subscribed users.";

  // Redux and Router Hooks
  const deriveInsights = useSelector((state) => state.deriveInsights?.active);
  const navigate = useNavigate();
  const { pmid } = useParams();
  const { user } = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.access_token);
  const user_id = user?.user_id;
  const [id1] = pmid ? pmid.split(":") : "";
  const id = Number(id1);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const source = params.get("source");
  const url = params.get("url");
  //const full_text_url = params.get("full_text_url");
  //console.log("full_text_url", full_text_url);
  const hasFetched = useRef(false);
  let buttonText = "";
  if (source === "PubMed") {
    if (url && url.includes("pmc.ncbi.nlm")) {
      buttonText = "View Full Text";
    } else {
      buttonText = "No Full Text";
    }
  } else {
    buttonText = "View Article";
  }

  //const noFullTetUrl = source === "PubMed" ? articleData.full_text_url ?  : false;
  // const fullTextUrl = params.get("full_text_url");
  // console.log("fullTextUrl", fullTextUrl);

  // Refs
  const endOfMessagesRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const contentRef = useRef(null);
  const selectedTextRef = useRef("");
  const popupRef = useRef(null);
  const popupPositionRef = useRef({ x: 0, y: 0 });

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [articleData, setArticleData] = useState(null);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadFullText, setLoadFullText] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);
  const [showScrollDownButton, setShowScrollDownButton] = useState(false);
  const [showStreamingSection, setShowStreamingSection] = useState(false);
  const [contentWidth, setContentWidth] = useState();
  const [ratingsList, setRatingsList] = useState([]);
  const [triggerAskClick, setTriggerAskClick] = useState(false);
  const [articleTitle, setArticleTitle] = useState("");
  const [collections, setCollections] = useState([]);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [currentid, setCurrentid] = useState(null);
  const [collectionAction, setCollectionAction] = useState("existing");
  const [selectedCollection, setSelectedCollection] = useState("favorites");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [sessions, setSessions] = useState([]);
  //const [showFullText, setShowFullText] = useState(false);
  //const [fullTextData, setFullTextData] = useState(null);
  const [error, setError] = useState(null);
  const [annotateData, setAnnotateData] = useState(
    location.state?.annotateData || ""
  );
  const [chatHistory, setChatHistory] = useState(() => {
    const storedHistory = localStorage.getItem("chatHistory");
    return storedHistory ? JSON.parse(storedHistory) : [];
  });

  //API Calls

  // Fetch collections for the user
  const fetchCollections = async () => {
    try {
      const response = await axios.get(
        // `https://inferai.ai/api/bookmarks/${user_id}/collections`,
        `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/bookmarks?user_id=${user_id}`,
        {
          headers: {
            // Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        setCollections(response.data.collections);
        if (response.data.collections.length > 0) {
          localStorage.setItem(
            "collections",
            JSON.stringify(response.data.collections)
          );
        }
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  //function to change rating for an article
  const handleRatingChange = async (uniqueId, newRating) => {
    const [article_source, article_id] = uniqueId.split("_");

    try {
      await axios
        .post(
          "https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/ratings",
          {
            user_id,
            url,
            rating: newRating,
            article_source,
          },
          {
            headers: {
              //Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          setRatingsList(newRating);
          showSuccessToast("Rating saved successfully");
        });
    } catch (error) {
      console.error("Error saving rating:", error);
    }
  };

  //function to unsave bookmark click
  const handleBookmarkClick = async (idType, title, source) => {
    const { isBookmarked, collectionName } = isArticleBookmarked(idType);

    if (isBookmarked) {
      try {
        const response = await axios.delete(
          // `https://inferai.ai/api/bookmarks/users/${user_id}/collections/${collectionName}/${idType}`,
          `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/bookmarks?user_id=${user_id}&collection_name=${collectionName}&url=${url}`,
          {
            // headers: { Authorization: `Bearer ${token}` },
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          const updatedCollections = {
            ...collections,
            [collectionName]: collections[collectionName].filter(
              (article) => article.url !== url
            ),
          };

          setCollections(updatedCollections);
          localStorage.setItem(
            "collections",
            JSON.stringify(updatedCollections)
          );
          await fetchCollections();
        }
      } catch (error) {
        console.error("Error deleting bookmark:", error);
      }
    } else {
      setCurrentid(idType);
      setArticleTitle(title);
      setIsModalOpen(true);
    }
  };

  //function to save bookmark to existing collection
  const handleSaveToExisting = async (collectionName) => {
    if (!collectionName) return;
    const bookmarkData = {
      user_id,
      collection_name: collectionName,
      bookmark: {
        url,
        article_title: articleTitle,
        article_source: source,
      },
    };

    try {
      const response = await axios.post(
        "https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/book",
        bookmarkData,
        {
          headers: {
            //Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        console.log("collections update before");
        const updatedCollections = {
          ...collections,
          [collectionName]: [
            ...(collections[collectionName] || []),
            {
              url,
              article_title: articleTitle,
              article_source: source,
            },
          ],
        };
        setCollections(updatedCollections);
        console.log("updatedCollections", updatedCollections);
        localStorage.setItem("collections", JSON.stringify(updatedCollections));
        console.log("collections stored in local storage");
        showSuccessToast("Added to Existing Collection");
        await fetchCollections();
        setIsModalOpen(false);
      }
    } catch (error) {
      showErrorToast("Failed to Add to the collection");
      console.error("Error adding bookmark to existing collection:", error);
    }
  };

  //function to save bookmark to new collection
  const handleCreateNewCollection = async () => {
    if (!newCollectionName) return;
    const newCollection = {
      user_id,
      collection_name: newCollectionName,
      bookmark: {
        url,
        article_title: articleTitle,
        article_source: source,
      },
    };

    try {
      const response = await axios.post(
        "https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/book",
        newCollection,
        {
          headers: {
            //Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        console.log("collections update before");
        await fetchCollections(); // Refetch collections after successful creation
        setNewCollectionName("");
        setCollectionAction("existing");
        setIsModalOpen(false);
        handleCloseCollectionModal();
      }
      showSuccessToast("New Collection Created");
    } catch (error) {
      showErrorToast("Failed to CreateCollection");
      console.error("Error creating new collection:", error);
    }
  };

  //function to ask a query to the article
  const handleAskClick = async () => {
    if (!query) {
      showErrorToast("Please enter a query");
      return;
    }
    setIsStreamDone(false);
    setShowStreamingSection(true);
    setLoading(true);

    const newChatEntry = { query, response: "", showDot: true };
    setChatHistory((prevChatHistory) => [...prevChatHistory, newChatEntry]);

    const sessionKey = `${source}_${id}`;
    const storedSessionId =
      JSON.parse(sessionStorage.getItem("articleSessions"))?.[sessionKey] || "";

    const bodyData = JSON.stringify({
      question: query,
      user_id: user_id,
      session_id: storedSessionId || undefined,
      source: source,
      //article_id: Number(id),
    });

    try {
      const response = await fetch(
        "https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/generate-answer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            //Authorization: `Bearer ${token}`,
          },
          body: bodyData,
        }
      );
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      setQuery("");

      const readStream = async () => {
        try {
          let autoScrollSet = false;
          const delay = 0; // Remove or reduce delay

          while (true) {
            if (isStreamDoneRef.current) break;

            const { value, done: streamDone } = await reader.read();
            if (streamDone) break;

            if (value) {
              buffer += decoder.decode(value, { stream: true });

              while (buffer.indexOf("{") !== -1 && buffer.indexOf("}") !== -1) {
                let start = buffer.indexOf("{");
                let end = buffer.indexOf("}", start);
                if (start !== -1 && end !== -1) {
                  const jsonChunk = buffer.slice(start, end + 1);
                  buffer = buffer.slice(end + 1);

                  try {
                    const parsedData = JSON.parse(jsonChunk);

                    if (parsedData.session_id) {
                      const articleSessions =
                        JSON.parse(sessionStorage.getItem("articleSessions")) ||
                        {};
                      sessionStorage.setItem(
                        "session_id",
                        parsedData.session_id
                      );
                      articleSessions[sessionKey] = parsedData.session_id;
                      sessionStorage.setItem(
                        "articleSessions",
                        JSON.stringify(articleSessions)
                      );
                    }

                    const answer = parsedData.answer;

                    // Process in larger chunks
                    for (let i = 0; i < answer.length; i += 10) {
                      if (isStreamDoneRef.current) break;

                      const chunk = answer.slice(i, i + 10); // 10 characters at a time
                      setChatHistory((chatHistory) => {
                        const updatedChatHistory = [...chatHistory];
                        const lastEntryIndex = updatedChatHistory.length - 1;

                        if (lastEntryIndex >= 0) {
                          updatedChatHistory[lastEntryIndex] = {
                            ...updatedChatHistory[lastEntryIndex],
                            response:
                              (updatedChatHistory[lastEntryIndex].response ||
                                "") + chunk,
                            showDot: true,
                          };
                        }

                        return updatedChatHistory;
                      });

                      setResponse((prev) => prev + chunk);

                      if (!autoScrollSet && endOfMessagesRef.current) {
                        setAutoScrollEnabled(true);
                        autoScrollSet = true;
                      }

                      await new Promise((resolve) =>
                        setTimeout(resolve, delay)
                      );
                    }
                  } catch (error) {
                    console.error("Error parsing JSON chunk:", error);
                  }
                }
              }
            }
          }

          setRefreshSessions((prev) => !prev);
          setLoading(false);
          localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
        } catch (error) {
          console.error("Error fetching or reading stream:", error);

          setChatHistory((chatHistory) => {
            const updatedChatHistory = [...chatHistory];
            const lastEntryIndex = updatedChatHistory.length - 1;

            if (lastEntryIndex >= 0) {
              updatedChatHistory[lastEntryIndex] = {
                ...updatedChatHistory[lastEntryIndex],
                response:
                  "There is some error. Please try again after some time.",
                showDot: false,
              };
            }

            return updatedChatHistory;
          });

          setLoading(false);
        }
      };

      readStream();
    } catch (error) {
      console.error("Error fetching or reading stream:", error);
      setLoading(false);
    }
  };

  //Functions

  //function to show send to notes popup
  const handleMouseUp = (event) => {
    if (!isLoggedIn) return;
    if (!contentRef.current || !contentRef.current.contains(event.target)) {
      return;
    }
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString().trim();

      if (selectedText) {
        const rects = range.getClientRects();
        const lastRect = rects[rects.length - 1];
        if (lastRect) {
          selectedTextRef.current = selectedText;

          // Calculate position based on layerX and layerY
          let x = event.layerX;
          let y = event.layerY;

          // Adjust position if it exceeds the target's boundaries
          const targetWidth = event.target.offsetWidth;
          const popupWidth = popupRef.current
            ? popupRef.current.offsetWidth
            : 0;

          // Ensure the popup stays within the horizontal bounds
          if (x + popupWidth > targetWidth) {
            x = targetWidth - popupWidth - 5; // Add a small margin
          }

          // Ensure the popup doesn't exceed the left boundary
          if (x < 0) {
            x = 5; // Add a small margin
          }

          popupPositionRef.current = { x, y };

          if (popupRef.current) {
            popupRef.current.style.left = `${popupPositionRef.current.x}px`;
            popupRef.current.style.top = `${popupPositionRef.current.y + 5}px`;
            popupRef.current.style.display = "block";
          }
        } else {
          if (popupRef.current) {
            popupRef.current.style.display = "none";
          }
        }
      } else {
        if (popupRef.current) {
          popupRef.current.style.display = "none";
        }
      }
    }
  };

  //function to save selected text to notes
  const handleSaveToNote = () => {
    const textToSave = selectedTextRef.current;
    if (textToSave) {
      setSavedText(textToSave);
    }
    if (!openNotes) {
      setOpenNotes(true);
    }
    if (popupRef.current) {
      popupRef.current.style.display = "none";
    }
  };

  const isArticleBookmarked = (idType) => {
    const article_url = url;
    for (const [collectionName, articleArray] of Object.entries(collections)) {
      const found = articleArray.some((article) => article.url === article_url);

      if (found) {
        return { isBookmarked: true, collectionName };
      }
    }
    return { isBookmarked: false, collectionName: null };
  };

  const handleCloseCollectionModal = () => {
    setCollectionAction("existing");
    setNewCollectionName("");
    setSelectedCollection("favorites");
    setIsModalOpen(false);
  };

  const getid = () => {
    return `${source}_${id}`;
  };

  const uniqueId = getid();

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;

    // Check if the user scrolled up (not at the bottom)
    if (scrollTop + clientHeight < scrollHeight - 50) {
      setAutoScrollEnabled(false);
      setShowScrollDownButton(true); // Show the down arrow button
    } else {
      setShowScrollDownButton(false); // Hide the down arrow button when at the bottom
    }
  };

  const scrollToBottom = () => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
      setAutoScrollEnabled(true); // Re-enable auto-scroll
    }
  };

  const handlePromptClick = (queryText) => {
    setQuery(queryText);
    setTriggerAskClick(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAskClick();
    }
  };
  const storedSessionId =
    sessionStorage.getItem("sessionId") || sessionStorage.getItem("session_id");
  const handleBackClick = () => {
    const unsavedChanges = localStorage.getItem("unsavedChanges");

    if (unsavedChanges === "true") {
      setShowConfirmPopup(true);
      return; // Do not proceed further if unsaved changes exist
    }

    // Retrieve session IDs from localStorage
    const sessionIds = JSON.parse(localStorage.getItem("sessionIds")) || [];

    if (sessionIds.length > 1) {
      // Remove the last session ID
      const currentSessionId = sessionIds.pop();

      // Set the previous session ID (last after pop) in sessionStorage
      const previousSessionId = sessionIds[sessionIds.length - 1];
      sessionStorage.setItem("session_id", previousSessionId);

      // Update localStorage with the remaining session IDs
      localStorage.setItem("sessionIds", JSON.stringify(sessionIds));
    } else if (sessionIds.length === 1) {
      // If there's only one session, clear sessionStorage and localStorage for session_id
      sessionStorage.removeItem("session_id");
      localStorage.removeItem("sessionIds");
    } else {
      // If there are no session IDs in localStorage
      setActiveSessionId(null);
      sessionStorage.removeItem("session_id");
    }

    setClickedBack(true);
    navigate(-1);
  };

  const handleCancelConfirm = () => {
    setShowConfirmPopup(false);
  };
  const handleOk = () => {
    setShowConfirmPopup(false);
    localStorage.removeItem("unsavedChanges");
    navigate(-1);
  };

  const MyMarkdownComponent = ({ markdownContent, handleMouseUp }) => {
    return (
      <div onMouseUp={handleMouseUp}>
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]} // Enables HTML parsing
        >
          {markdownContent}
        </ReactMarkdown>
      </div>
    );
  };

  const renderContentInOrder = (contentArray) => {
    return contentArray.map((section, index) => {
      if (!section.type || !section.content) return null;
      if (section.type.includes("subsubsubheading")) {
        return (
          <h3
            key={index}
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            {section.content}
          </h3>
        );
      } else if (section.type.includes("subsubheading")) {
        return (
          <h2
            key={index}
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            {section.content}
          </h2>
        );
      } else if (section.type.includes("subheading")) {
        return (
          <h2
            key={index}
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "15px",
            }}
          >
            {section.content}
          </h2>
        );
      } else if (section.type === "text") {
        return (
          <p key={index} style={{ marginBottom: "10px", lineHeight: "1.5" }}>
            <MyMarkdownComponent markdownContent={section.content} />
          </p>
        );
      }

      return null;
    });
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    sessionStorage.setItem("session_id", "");
    //   localStorage.setItem("chatHistory", []);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);
  useEffect(() => {
    const articleContent = document.querySelector(".meta");
    const handleScroll = () => {
      if (articleContent.scrollTop > 20) {
        document.getElementById("scrollTopBtn").style.display = "block"; // Show the button
      } else {
        document.getElementById("scrollTopBtn").style.display = "none"; // Hide the button
      }
    };
    // Attach the scroll event listener to .article-content
    if (articleContent) {
      articleContent.addEventListener("scroll", handleScroll);
    }

    // Clean up event listener on component unmount
    return () => {
      if (articleContent) {
        articleContent.removeEventListener("scroll", handleScroll);
      }
    };
  });
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [chatHistory]);
  useEffect(() => {
    // Auto-scroll to the bottom if enabled
    if (autoScrollEnabled && endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
      setAutoScrollEnabled(false);
    }
  }, [chatHistory, autoScrollEnabled]);

  useEffect(() => {
    isStreamDoneRef.current = isStreamDone; // Sync the ref with the state
  }, [isStreamDone]);

  useEffect(() => {
    if (triggerAskClick) {
      handleAskClick();
      setTriggerAskClick(false); // Reset the flag after handling the click
    }
  }, [query, triggerAskClick]);
  // To retrive the chat history from the session storage
  useEffect(() => {
    const storedChatHistory = localStorage.getItem("chatHistory");
    if (storedChatHistory) {
      setChatHistory(JSON.parse(storedChatHistory));
      setShowStreamingSection(true);
    }
  }, []);

  useEffect(() => {
    if (annotateLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [annotateLoading]);

  useEffect(() => {
    if (user_id && token) {
      fetchCollections();
    }
  }, [user_id, token]);

  useEffect(() => {
    if (!openNotes) {
      setSavedText("");
    }
  }, [openNotes]);

  useEffect(() => {
    if (source && url && !deriveInsights) {
      setAnnotateLoading(true);
      const fetchArticleData = async () => {
        try {
          const response = await axios.get(
            `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/abstract?url=${url}&source=${source}`,
            {
              headers: {
                // Authorization: `Bearer ${token}`,
              },
            }
          );
          const article = response.data;
          setArticleData(article);
          setAnnotateLoading(false);
          const savedTerm = sessionStorage.getItem("SearchTerm");
          setSearchTerm(savedTerm);
        } catch (error) {
          setAnnotateLoading(false);
          console.error("Error fetching article data:", error);
          console.error(
            "Error fetching article data:",
            error.response?.data || error.message
          );
        }
      };

      fetchArticleData();
    }
  }, [id, source, token, deriveInsights]);
  //console.log("articleData", articleData);

  useEffect(() => {
    const fetchRatedArticle = async () => {
      try {
        const response = await axios.get(
          `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/ratings?user_id=${user_id}&url=${encodeURIComponent(
            url
          )}`
        );
        const ratings = response.data.data.rating;
        setRatingsList(ratings);
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchRatedArticle();
  }, []);
  //console.log(ratingsList);

  useEffect(() => {
    // Access the computed width of the content div
    if (contentRef.current) {
      const width = contentRef.current.offsetWidth;
      setContentWidth(`${width}px`);
    }
  }, [openAnnotate]);

  useEffect(() => {
    // Access the computed width of the content div
    if (contentRef.current) {
      const width = contentRef.current.offsetWidth;
      setContentWidth(`${width}px`);
    }
  }, [openNotes]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(
          `https://inferai.ai/api/history/conversations/history/${user_id}`,
          {
            headers: {
              //Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data?.sessions) {
          const sessionsData = response.data.sessions.reverse();
          setSessions(sessionsData);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    if (user_id && token) {
      fetchSessions();
    }
  }, [user_id, token]);

  //useEffect for fetching the chat history from the session storage
  useEffect(() => {
    const storedChatHistory = localStorage.getItem("chatHistory");

    if (storedChatHistory) {
      setChatHistory(JSON.parse(storedChatHistory));
      setShowStreamingSection(true);
    } else {
      setShowStreamingSection(false);
    }
  }, [location.state]);

  useEffect(() => {
    if (!articleData || hasFetched.current) return;

    const full_text_url = articleData.full_text_url;
    const fullarcSource = source.toLocaleLowerCase();

    console.log("full_text_url", full_text_url);
    console.log("fullarcSource", fullarcSource);

    if (!full_text_url || !fullarcSource) {
      setError("Invalid URL or Source missing.");
      return;
    }

    hasFetched.current = true; // ✅ Mark only after data is validated

    const fetchFullText = async () => {
      try {
        const requestUrl = `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/full_text?source=${fullarcSource}&url=${full_text_url}`;
        const response = await axios.get(requestUrl);
        console.log("API Response:", response.data);

        if (response.data && Array.isArray(response.data.body)) {
          setFullTextData(response.data);
          console.log("Full Text Data:", fullTextData);
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
  }, [articleData]); // 👈 Run only when articleData updates
  console.log("fullTextData", fullTextData);

  const handleFullTextNavigate = (fullTextUrl) => {
    if (!fullTextUrl) {
      alert("No full text available");
      return;
    }

    // Encode URL safely for passing as a parameter
    const encodedUrl = encodeURIComponent(fullTextUrl);
    const encodedSource = encodeURIComponent(source);

    // Open a new tab with the full-text URL
    const newTab = window.open(
      `${window.location.origin}/fulltext?url=${encodedUrl}&source=${encodedSource}`,
      "_blank"
    );
    if (!newTab) {
      alert("Popup blocked! Allow popups for this site.");
    }
  };

  return (
    <>
      {loadFullText && <Loading />}
      {articleData ? (
        <div
          className="article-content"
          onMouseUp={handleMouseUp}
          ref={contentRef}
          // style={{ height: heightIfLoggedIn }}
        >
          <div className="article-content-inside">
            <div className="article-title">
              <div
                style={{
                  display: "flex",
                  cursor: "pointer",
                  marginTop: "1%",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex" }} onClick={handleBackClick}>
                  <img
                    src={Arrow}
                    style={{ width: "14px" }}
                    alt="arrow-icon"
                  ></img>
                  <button className="back-button">Back</button>
                </div>
                {/* HI varun */}
                {showConfirmPopup && (
                  <div className="Article-popup-overlay">
                    <div className="Article-popup-content">
                      <p className="Saving-note">Saving Note</p>
                      <p id="confirming">
                        Are you sure to leave without saving?
                      </p>
                      <div className="Article-confirm-buttons">
                        <button
                          className="overlay-cancel-button"
                          onClick={handleCancelConfirm}
                        >
                          Cancel
                        </button>
                        <button
                          className="overlay-ok-button"
                          onClick={handleOk}
                        >
                          Leave
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div
                  className="Rate-Article"
                  // style={{ display: displayIfLoggedIn }}
                >
                  <div className="rate-article-div">
                    <span>Rate the article </span>
                  </div>
                  <div className="rate" key={ratingsList}>
                    {[5, 4, 3, 2, 1].map((value) => {
                      return (
                        <React.Fragment key={value}>
                          <input
                            type="radio"
                            id={`star${value}-${uniqueId}`}
                            name={`rate_${uniqueId}`}
                            value={isLoggedIn ? value : ""}
                            checked={isLoggedIn ? ratingsList === value : ""}
                            onChange={() =>
                              !isLoggedIn
                                ? ""
                                : handleRatingChange(uniqueId, value)
                            }
                            // disabled={!!existingRating} // Disable if a rating already exists
                          />
                          <label
                            style={{
                              cursor: isLoggedIn ? "pointer" : "not-allowed",
                              opacity:
                                annotateData && annotateData.length > 0 ? 1 : 1, // Adjust visibility when disabled
                            }}
                            title={
                              isLoggedIn ? "Rate the article" : displayMessage
                            }
                            htmlFor={`star${value}-${uniqueId}`}
                            // title={`${value} star`}
                          />
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="ArticleTitle-Bookmark">
                <p
                  style={{
                    marginTop: "0",
                    marginBottom: "0",
                    color: "#0071bc",
                    fontSize: !openNotes && !openAnnotate ? "20px" : undefined,
                  }}
                >
                  {articleData.title}
                </p>

                <FontAwesomeIcon
                  icon={
                    isArticleBookmarked(id).isBookmarked
                      ? solidBookmark
                      : regularBookmark
                  }
                  size="l"
                  style={{
                    color: isArticleBookmarked(id).isBookmarked
                      ? "#1B365D"
                      : "black",
                    cursor: isLoggedIn ? "pointer" : "not-allowed",
                    opacity: isLoggedIn ? 1 : 0.5,
                  }}
                  onClick={() =>
                    isLoggedIn
                      ? handleBookmarkClick(
                          id,
                          articleData.title,
                          source || "PubMed"
                        )
                      : ""
                  }
                  title={
                    isLoggedIn
                      ? isArticleBookmarked(id).isBookmarked
                        ? "Bookmarked"
                        : "Bookmark this article"
                      : displayMessage
                  }
                />

                {isModalOpen && (
                  <div className="bookmark-modal-overlay">
                    <div className="search-modal-content">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <p>ADD TO COLLECTION</p>
                        <button
                          id="close-collection-modal"
                          onClick={handleCloseCollectionModal}
                        >
                          <IoCloseOutline size={20} />
                        </button>
                      </div>
                      {/* Radio buttons for collection action */}
                      <div className="radio-buttons">
                        <div className="radio1">
                          <input
                            type="radio"
                            id="collectionAction1"
                            value="existing"
                            checked={collectionAction === "existing"}
                            onChange={() => setCollectionAction("existing")}
                          />
                          <label htmlFor="collectionAction1">
                            Add to Existing Collection
                          </label>
                        </div>
                        <div className="radio2">
                          <input
                            type="radio"
                            id="collectionAction2"
                            value="new"
                            checked={collectionAction === "new"}
                            onChange={() => setCollectionAction("new")}
                          />
                          <label htmlFor="collectionAction2">
                            Create New Collection
                          </label>
                        </div>
                      </div>

                      {/* Logic for adding to existing collection */}
                      {collectionAction === "existing" && (
                        <div className="select-dropdown">
                          <div className="choose-collection">
                            <label htmlFor="">*Choose a collection</label>
                            <select
                              name="collections"
                              id="collection-select"
                              className="select-tag"
                              style={{
                                width: "35%",
                                height: "5vh",
                              }}
                              value={selectedCollection}
                              onChange={(e) =>
                                setSelectedCollection(e.target.value)
                              }
                            >
                              <option value="favorites" disabled selected>
                                Favorites
                              </option>
                              {Object.keys(collections).map(
                                (collectionName, index) => (
                                  <option key={index} value={collectionName}>
                                    {collectionName}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "20px",
                              // marginTop: "15px",
                            }}
                          >
                            <button
                              onClick={() =>
                                handleSaveToExisting(selectedCollection)
                              }
                              disabled={!selectedCollection}
                            >
                              Add
                            </button>
                            <button onClick={handleCloseCollectionModal}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      {collectionAction === "new" && (
                        <div>
                          <input
                            type="text"
                            value={newCollectionName}
                            onChange={(e) =>
                              setNewCollectionName(e.target.value)
                            }
                            placeholder="New collection name"
                          />
                          <div
                            style={{
                              display: "flex",
                              gap: "20px",
                              marginTop: "15px",
                            }}
                          >
                            <button
                              onClick={handleCreateNewCollection}
                              disabled={!newCollectionName}
                            >
                              Create
                            </button>
                            <button onClick={handleCloseCollectionModal}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className="meta"
              style={{ height: !isLoggedIn ? "42" : undefined }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  fontSize: "14px",
                  color: "grey",
                  marginBottom: "5px",
                }}
              >
                <p className="Article-Authors" style={{ marginBottom: "0" }}>
                  <span style={{ color: "#2b9247" }}>Authors: </span>
                  {(articleData.authors || "") // Ensure it's a valid string
                    .toString() // Convert to string if it's not
                    .split(/\s*,\s*/) // Split by commas, handling spaces
                    .map((author, index, arr) => (
                      <span key={index}>
                        {author}
                        {index < arr.length - 1 ? ", " : ""}{" "}
                        {/* Add comma except for last */}
                      </span>
                    ))}
                </p>
              </div>

              {articleData.abstract && (
                <>
                  <p className="article-abstract">
                    {renderContentInOrder(articleData.abstract, true)}
                  </p>
                </>
              )}
              {articleData.keywords && (
                <div>
                  <p className="article-keywords">
                    <span style={{ color: "#2b9247" }}> Keywords : </span>
                    {articleData.keywords}
                  </p>
                </div>
              )}
              {showStreamingSection && (
                <div className="streaming-section">
                  <div className="streaming-content">
                    <div
                      ref={messagesContainerRef}
                      className="messages-container"
                    >
                      {chatHistory.map((chat, index) => (
                        <div key={index}>
                          {chat.query && (
                            <div className="query-asked">
                              <span>
                                {chat.query === "Summarize this article"
                                  ? "Summarize"
                                  : chat.query ===
                                    "what can we conclude form this article"
                                  ? "Conclusion"
                                  : chat.query ===
                                    "what are the key highlights from this article"
                                  ? "Key Highlights"
                                  : chat.query}
                              </span>
                            </div>
                          )}

                          {chat.response && (
                            <div
                              className="response"
                              style={{ textAlign: "left" }}
                            >
                              <>
                                <span>
                                  <ReactMarkdown>{chat.response}</ReactMarkdown>
                                </span>
                                <div ref={endOfMessagesRef} />
                              </>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* This div will act as the reference for scrolling */}
                  </div>
                </div>
              )}
              <div
                ref={popupRef}
                className="popup-button"
                // className="Popup"
                style={{
                  position: "absolute",
                  display: "none", // Initially hidden
                  backgroundColor: "#afa7a7",
                  // padding: "5px",
                  color: "white",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                //onClick={handleSaveToNote}
              >
                <button
                  onClick={handleSaveToNote}
                  className="Popup-buttons"
                  title="Send to Notes"
                >
                  <span className="send-to-notes">Send to notes</span>
                  <LiaTelegramPlane size={20} color="black" />
                </button>
              </div>
            </div>
          </div>
          <div
            className="article-chat-query"
            style={{
              cursor: isLoggedIn ? "" : "not-allowed",
              opacity: isLoggedIn ? 1 : 0.5,
            }}
            title={isLoggedIn ? "" : displayMessage}
          >
            <div className="predefined-prompts">
              <button
                style={{ cursor: isLoggedIn ? "pointer" : "not-allowed" }}
                onClick={() =>
                  isLoggedIn ? handlePromptClick("Summarize this article") : ""
                }
              >
                Summarize
              </button>
              <button
                style={{ cursor: isLoggedIn ? "pointer" : "not-allowed" }}
                onClick={() =>
                  isLoggedIn
                    ? handlePromptClick(
                        "what can we conclude form this article"
                      )
                    : ""
                }
              >
                Conclusion
              </button>
              <button
                style={{ cursor: isLoggedIn ? "pointer" : "not-allowed" }}
                onClick={() =>
                  isLoggedIn
                    ? handlePromptClick(
                        "what are the key highlights from this article"
                      )
                    : ""
                }
              >
                Key Highlights
              </button>

              <button
                onClick={() =>
                  isLoggedIn
                    ? handleFullTextNavigate(articleData.full_text_url)
                    : ""
                }
                style={{ cursor: isLoggedIn ? "pointer" : "not-allowed" }}
              >
                {buttonText}
              </button>

              {/* <button
                onClick={handleFullText}
                title="View full text"
                style={{ cursor: isLoggedIn ? "pointer" : "not-allowed" }}
              >
                Full Text
              </button> */}
            </div>
            <div
              className="stream-input"
              style={{ cursor: isLoggedIn ? "" : "not-allowed" }}
            >
              <img src={flag} alt="flag-logo" className="stream-flag-logo" />
              <input
                style={{ cursor: isLoggedIn ? "" : "not-allowed" }}
                type="text"
                placeholder="Ask anything..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={isLoggedIn ? handleKeyDown : null} // Pass null when not logged in
              />
              {loading ? (
                <CircularProgress
                  className="button"
                  size={24}
                  style={{ marginLeft: "1.5%" }}
                  color="white"
                />
              ) : (
                <FontAwesomeIcon
                  className="button"
                  onClick={isLoggedIn && query ? handleAskClick : null} // Disable click if query is null/empty
                  icon={faTelegram}
                  size={"xl"}
                  style={{
                    cursor: isLoggedIn && query ? "pointer" : "not-allowed", // Set cursor
                    color: isLoggedIn && query ? "" : "grey", // Change color to grey when disabled
                  }}
                  title={!query ? "Please enter a query to continue" : ""}
                />
              )}
            </div>
          </div>
          {showScrollDownButton && (
            <button
              className="scroll-down-button"
              onClick={scrollToBottom}
              title="Scroll to bottom"
            >
              <FontAwesomeIcon icon={faArrowDown} />
            </button>
          )}
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default ArticleContent;
