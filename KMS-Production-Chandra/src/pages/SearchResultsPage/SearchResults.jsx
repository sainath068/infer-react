import React, { useEffect, useRef, useState, useMemo } from "react";
import "./SearchResults.css";
import { apiService } from "../../assets/api/apiService";
import Footer from "../../components/Footer-New";
import SearchIcon from "../../assets/images/Search.svg";
import Loading from "../../components/Loading";
import { useDispatch, useSelector } from "react-redux";
import Annotation from "../../components/Annotaions";
import { useLocation, useNavigate, Link } from "react-router-dom";
import annotate from "../../assets/images/task-square.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark as regularBookmark } from "@fortawesome/free-regular-svg-icons";
import { faBookmark as solidBookmark } from "@fortawesome/free-solid-svg-icons";
import { faAnglesUp } from "@fortawesome/free-solid-svg-icons";
//import uparrow from "../../assets/images/uparrow.svg";
//import downarrow from "../../assets/images/downarrow.svg";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "../../utils/toastHelper";
import NoteItem from "../../components/Notes/NoteItem";
import filtersIcon from "../../assets/images/001-edit 1.svg"
import homeIcon from "../../assets/images/homeIcon.svg"
import { PiShareNetwork } from "react-icons/pi";
import { setSearchResults, clearSearchResults } from "../../redux/actions/actions";
import FiltersSection from "../../components/Filters/Filters";
import FiltersTabView from "../../components/Filters/TabFilters";
import FiltersMobileView from "../../components/Filters/MobileFilters";

import SearchNavbar from "../../components/SearchNavbar";
const SearchResults = ({ open, onClose, applyFilters, dateloading }) => {
  const location = useLocation(); 
  const dispatch = useDispatch();
  const ITEMS_PER_PAGE = 35;
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const searchTerm = params.get("query");
  const url = params.get("url");
  console.log("url",url);
  console.log("search Term",searchTerm);
  useEffect(()=>{
    if(location.state===null){
    // navigate("/")
  }
},[])
const { data } = location.state || { data: [] };
const page = params.get("page");
useEffect(() => {

  if (!searchTerm) {
    navigate("/"); 
    return;
  }

  if (!location.state) {
    handleFetchResults(searchTerm, page);
    console.log("called")
  }
}, [location.state,searchTerm]); 

const handleFetchResults = (query, pageNumber) => {
  dispatch(clearSearchResults());
  sessionStorage.removeItem("ResultData");

  if (!query) {
    return;
  }

  setLoading(true);
  const timeoutId = setTimeout(() => {
    setLoading(false);
    navigate(`/search?query=${encodeURIComponent(query)}&page=${pageNumber}`, { state: { data: [] } });
  }, 60000); 

  apiService
    .searchTerm(query, pageNumber)
    .then((response) => {
      const data = response.data;
      setLoading(false);
      dispatch(setSearchResults(data));
      clearTimeout(timeoutId);

      navigate(`/search?query=${encodeURIComponent(query)}&page=${pageNumber}`, { state: { data } });
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      setLoading(false);

      if (error.response && [500, 404, 422].includes(error.response.status)) {
        navigate("/server-error");
      } else {
        navigate(`/search?query=${encodeURIComponent(query)}&page=${pageNumber}`, { state: { data: [] } });
      }

      console.error("Error fetching data from the API", error);
    });
};
const searchResults = useSelector((state) => state.search.searchResults);
  const { user } = useSelector((state) => state.auth);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const displayIfLoggedIn = isLoggedIn ? null : "none";
  const displayMessage = isLoggedIn
    ? ""
    : "This feature is available for subscribed users.";
  const user_id = user?.user_id;
  const token = useSelector((state) => state.auth.access_token);
  //const navigate = useNavigate();
  const contentRightRef = useRef(null);
  const [result, setResults] = useState();
  const [loading, setLoading] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [bioRxivArticles, setBioRxivArticles] = useState([]);
  const [plosArticles, setPlosArticles] = useState([]);
  const [handleAnnotateCall, setHandleAnnotateCall] = useState(false);
  const totalArticles = useMemo(() => {
    return [...bioRxivArticles, ...plosArticles, ...selectedArticles];
  }, [bioRxivArticles, plosArticles, selectedArticles]);
  const [shareableLinks, setShareableLinks] = useState({});
  const [currentIdType, setCurrentIdType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const [bookmarkedUrls, setBookmarkedUrls] = useState(new Set()); 
  const [selectedNote, setSelectedNote] = useState([]);
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
 
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchNotes = async () => {
    try {
      const response = await apiService.fetchNotes(user_id, token);
      const notesArray = Array.isArray(response.data.data)
        ? response.data.data
        : Object.values(response.data.data);

      setNotes(notesArray);
      localStorage.setItem("notes", JSON.stringify(notesArray));
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const prevTotalArticlesRef = useRef(totalArticles);
  useEffect(()=>{
    localStorage.removeItem("sessionIds")
  },[])
  useEffect(() => {
    if (handleAnnotateCall) {
      if (totalArticles.length > 1) {
        // Check if the previous totalArticles length or values are different
        const prevTotalArticles = prevTotalArticlesRef.current;
        const isDifferent =
          prevTotalArticles.length !== totalArticles.length ||
          JSON.stringify(prevTotalArticles) !== JSON.stringify(totalArticles);

        if (isDifferent) {
          handleAnnotateClick();
        }

        // Update the ref to the current totalArticles
        prevTotalArticlesRef.current = totalArticles;
        setHandleAnnotateCall(false);
      }
    }
  }, [handleAnnotateCall, totalArticles]); 

  const fetchCollections = async () => {
    try {
      const response = await apiService.fetchCollections(user_id, token);
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

  useEffect(() => {
    if (user_id && token) {
      fetchCollections();
    }
  }, [user_id, token]);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const [email, setEmail] = useState();

  const [emailSubject, setEmailSubject] = useState();
  const [description, setDecription] = useState();
  const [collectionAction, setCollectionAction] = useState("existing"); // Tracks which radio button is selected
  const [selectedCollection, setSelectedCollection] = useState("favorites");
  const [newCollectionName, setNewCollectionName] = useState("");

  const [selectedDateRange, setSelectedDateRange] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [completePMID, setCompletePMID] = useState([]);
  const [ratingsList, setRatingsList] = useState([]);
  // const [termMissing, setTermMissing] = useState(false);
  // Function to get the rating for a specific article by pmid
  const getRatingForArticle = (id, source) => {
    // Standardize source values for specific cases
    let standardizedSource = source;
    if (source === "MedRxiv") standardizedSource = "biorxiv";
    if (source === "Public Library of Science (PLOS)")
      standardizedSource = "plos";

    // Ensure `rated_articles` is an array within `ratingsList`
    const ratingsArray = Array.isArray(ratingsList?.rated_articles)
      ? ratingsList.rated_articles
      : [];

    // Find a matching entry with both `article_id` and `article_source`
    const savedRating = ratingsArray.find(
      (item) =>
        item.article_id === String(id) &&
        item.article_source === standardizedSource
    );

    // Return the saved rating or default to 3 if not found
    return savedRating ? savedRating.average_rating : 0;
  };

  // Use effect to fetch ratings only once on page load or reload
  useEffect(() => {
    const fetchRatedArticles = async () => {
      try {
        const response = await apiService.fetchRatedArticles(user_id);
        console.log("resposne form",response.data);
        const ratedArticles = response.data || [];
        console.log("ratedArticles",ratedArticles)
        sessionStorage.setItem("ratingsList", JSON.stringify(ratedArticles));
        setRatingsList(ratedArticles);
      } catch (error) {
        console.error("Error fetching rated articles:", error);
      }
    };

    const storedRatings = JSON.parse(sessionStorage.getItem("ratingsList"));
    if (!storedRatings || location.pathname === "/search") {
      fetchRatedArticles();
    } else {
      setRatingsList(storedRatings);
    }
  }, [location]);

  useEffect(() => {
    const storedDateInfo = localStorage.getItem("publicationDate");
    if (storedDateInfo) {
      const { selectedDateRange, customStartDate, customEndDate } =
        JSON.parse(storedDateInfo);

      if (selectedDateRange) {
        setSelectedDateRange(selectedDateRange);
      }
      if (selectedDateRange === "custom") {
        setCustomStartDate(customStartDate || "");
        setCustomEndDate(customEndDate || "");
      }
    }
  }, [result]);

  const [filters, setFilters] = useState({
    articleType: [],
    subjectArea: [], // ✅ Make sure this exists and is an array
    sourceType: [],
    dateRange: "",
    customStartDate: "",
    customEndDate: "",
  });
  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("filters", JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem("PublicationDate", selectedDateRange);
  }, [selectedDateRange]);
  // const [articleTitle, setArticleTitle] = useState("");
  // const [source, setSource] = useState("");
  // const [showArticleType, setShowArticleType] = useState(true);
  // const [showSubjectArea, setShowSubjectArea] = useState(true);
  // const [showBiorxiv, setShowBiorxiv] = useState(true);
  // const [showPlos, setShowPlos] = useState(true);
  // const [showSourceType, setShowSourceType] = useState(true);
  // const [showPublicationDate, setShowPublicationDate] = useState(true);
  const [openAnnotate, setOpenAnnotate] = useState(false);
  const [annotateData, setAnnotateData] = useState();
  const [annotateSource, setAnnotateSource] = useState();
  const [openNotes, setOpenNotes] = useState(false);
  const [annotateLoading, setAnnotateLoading] = useState(false);
  const [sortedData, setSortedData] = useState([]); // State to store sorted data
  const [selectedSort, setSelectedSort] = useState("best_match");
  const parseDate = (dateString) => {
    if (!dateString) return new Date(0); // Fallback for missing date (earliest possible date)
  
    const [day, month, year] = dateString.split("-");
    
    if (!day || !month || !year) {
      console.warn("Invalid date format:", dateString);
      return new Date(0); // Return earliest date if format is incorrect
    }
  
    const monthIndex = new Date(Date.parse(`${month} 1, ${year}`)).getMonth(); // Get month index (e.g., "Jan" -> 0)
  
    return new Date(year, monthIndex, day); // Convert to a Date object
  };

  const scrollToTop = () => {
    if (contentRightRef.current) {
      contentRightRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll event listener to show or hide the scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;

      // Show button if scrolled down more than 100 pixels
      if (scrollTop > 100) {
        document.getElementById("scrollTopBtn").style.display = "block"; // Show button
      } else {
        document.getElementById("scrollTopBtn").style.display = "none"; // Hide button
      }
    };

    // Add event listener for window scroll
    window.addEventListener("scroll", handleScroll);

    // Clean up event listener
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sortedPublicationData =
  data?.body?.articles
    ? [...data.body.articles]
        .filter((article) => article.date) // Filter out articles with null/undefined dates
        .sort((a, b) => {
          const dateA = parseDate(a.date);
          const dateB = parseDate(b.date);
          return dateB - dateA; // Sort in descending order (newest first)
        })
    : [];

  useEffect(() => {
    // If the selected sort is neither "publication_date" nor "Ratings", default to "best_match"
    if (selectedSort !== "publication_date" && selectedSort !== "Ratings") {
      handleSortChange({ target: { value: "best_match" } });
    }
  }, [selectedSort]);

  const sortedRatingData = useMemo(() => {
    if (!data?.body?.articles || !Array.isArray(data.body.articles)) {
      return []; 
    }
  
    return [...data.body.articles].sort((a, b) => {
      const ratingA = getRatingForArticle(a.bioRxiv_id || a.plos_id || a.pmid || 0);
      const ratingB = getRatingForArticle(b.bioRxiv_id || b.plos_id || b.pmid || 0);
      return ratingB - ratingA; 
    });
  }, [data?.body?.articles, getRatingForArticle]); 
  
  

  // Function to handle sorting based on selected option
  const handleSortChange = (e) => {
    const sortType = e.target.value;
    setSelectedSort(sortType); 
    if (sortType === "publication_date") {
      setSortedData(sortedPublicationData);
    } else if (sortType === "best_match") {
      setSortedData(sortedSimilarityData);
    } else if (sortType === "Ratings") {
      setSortedData(sortedRatingData); 
    }
  };

  useEffect(() => {
    // Initialize with original data on component load
    setSortedData(searchResults?.body.articles || []);
  }, [searchResults]);
  let sessionDataCache = null; // Cache for session storage data

  // Utility function to get similarity score from article or session storage
  const getSimilarityScore = (article) => {
    let similarityScore = article.final_score;

    // If similarity score is not present in the article, try to retrieve it from session storage
    if (!similarityScore) {
      if (!sessionDataCache) {
        const storedData = sessionStorage.getItem("ResultData");
        sessionDataCache = storedData ? JSON.parse(storedData).articles : [];
      }

      // Find the article with the matching pmid in session storage and get similarity score
      const matchedArticle = sessionDataCache.find(
        (storedArticle) => storedArticle.pmid === article.pmid
      );
      similarityScore = matchedArticle
        ? matchedArticle.similarity_score || 0
        : 0;
    }

    return similarityScore || 0; // Default to 0 if no similarity score found
  };

  // Memoized sorting based on similarity score
  const sortedSimilarityData = useMemo(() => {
    if (!data?.body?.articles || !Array.isArray(data.body.articles)) {
      return [];
    }
  
    return [...data.body.articles].sort(
      (a, b) => getSimilarityScore(b) - getSimilarityScore(a)
    );
  }, [data?.body?.articles, getSimilarityScore]); // ✅ Corrected dependency array
  

  const initialPage = parseInt(params.get("page")) || 1;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageInput, setPageInput] = useState(initialPage);

  // Fetch stored page from session storage (if exists)
  useEffect(() => {
    const storedPage = sessionStorage.getItem("currentPage");
    if (storedPage) {
      setCurrentPage(parseInt(storedPage));
      setPageInput(parseInt(storedPage));
    }
  }, [page]);
  const [pageChanged,setPageChanged]=useState(false)
  // Fetch articles dynamically when `currentPage` changes
  useEffect(() => {
    if (pageChanged) {
      console.log("more")
      fetchMoreArticles(currentPage);
    }
  }, [pageChanged]);
  useEffect(() => {
    console.log("page")
    if (initialPage === 1) {
      sessionStorage.setItem("currentPage", "1"); 
    }
  }, []);
  // Compute pagination indices
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedArticles = sortedData;
  const handlePageChange = (newPage) => {
    const totalPages = 1000;

    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setPageInput(newPage);
      sessionStorage.setItem("currentPage", newPage);
      setPageChanged(true)
      scrollToTop();
    }
  };

  const fetchMoreArticles = (newPage) => {
    console.log("loading")
    // sessionStorage.removeItem("ResultData");
    setLoading(true)
    apiService
    .searchTerm(searchTerm, newPage)
    .then((response) => {
        dispatch(clearSearchResults());
        const data = response.data;
        dispatch(setSearchResults(data));
        sessionStorage.setItem("currentPage", newPage);
        setCurrentPage(newPage);
          setPageChanged(false)
        setLoading(false)
        navigate(`/search?query=${encodeURIComponent(searchTerm)}&page=${newPage}`,{ state: { data }});
      })
      .catch((error) => {
        setLoading(false)
        console.error("Error fetching more articles:", error);
      });
  };
  const handleAnnotate = () => {
    if (openAnnotate) {
      setOpenAnnotate(false);
    } else if (annotateData && Object.keys(annotateData).length > 0) {
      setOpenAnnotate(true);
    }
  };
  useEffect(() => {
    if (annotateLoading) {
      // Disable scrolling
      document.body.style.overflow = "hidden";
    } else {
      // Enable scrolling
      document.body.style.overflow = "auto";
    }

    // Cleanup to reset the overflow when the component is unmounted or annotateLoading changes
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [annotateLoading]);
  // const handleCloseCollectionModal = () => {
  //   setCollectionAction("existing"); // Reset to default state
  //   setNewCollectionName(""); // Clear input
  //   setSelectedCollection("favorites"); // Reset selection
  //   setIsModalOpen(false); // Close modal
  // };
  useEffect(() => {
    const fetchBookmarkedUrls = async () => {
      try {
        const response = await axios.get(
          `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/bookmarks?user_id=${user_id}&all_bookmarks=true`
        );
        if (response.status === 200 && response.data && Array.isArray(response.data.bookmarks)) {
          // Extract URLs from the bookmarks and store them in a Set for faster lookup
          const urlSet = new Set(response.data.bookmarks.map(bookmark => bookmark.url));
          setBookmarkedUrls(urlSet);
        }
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      }
    };
  
    if (isLoggedIn) {  // Fetch bookmarks only if user is logged in
      fetchBookmarkedUrls();
    }
  }, [searchResults]); // Re-run when search results change
  const isArticleBookmarked = (url) => {
    return bookmarkedUrls.has(url);
  };
  
  // const isArticleBookmarked = () => {
  //   const article_url = url;
  //  // console.log("article_url",article_url);
  //   for (const [collectionName, articleArray] of Object.entries(collections)) {
  //     const found = articleArray.some(
  //       (article) => article.url === article_url
  //     );

  //     if (found) {
  //       return { isBookmarked: true, collectionName }; // Return true with collection name
  //     }
  //   }

  //   return { isBookmarked: false, collectionName: null }; // Not found in any collection
  // };

  // const handleBookmarkClick = async (idType, title, source) => {
  //   const { isBookmarked, collectionName } = isArticleBookmarked(idType);

  //   if (isBookmarked) {
  //     try {
  //       const response = await apiService.bookmarkClick(
  //         user_id,
  //         collectionName,
  //         idType,
  //         token
  //       );
  //       if (response.status === 200) {
  //         // Remove the bookmark from local collections state
  //         const updatedCollections = {
  //           ...collections,
  //           [collectionName]: collections[collectionName].filter(
  //             (article) => article.article_id !== String(idType)
  //           ),
  //         };

  //         setCollections(updatedCollections);
  //         localStorage.setItem(
  //           "collections",
  //           JSON.stringify(updatedCollections)
  //         );
  //         await fetchCollections(); // Refetch collections after successful deletion
  //       }
  //     } catch (error) {
  //       console.error("Error deleting bookmark:", error);
  //     }
  //   } else {
  //     // Open modal for adding bookmark
  //     setCurrentIdType(idType);
  //     setArticleTitle(title);
  //     setSource(source);
  //     setIsModalOpen(true);
  //   }
  // };

  // const handleSaveToExisting = async (collectionName) => {
  //   if (!collectionName) return;
  //   const bookmarkData = {
  //     user_id,
  //     collection_name: collectionName,
  //     bookmark: {
  //       article_id: String(currentIdType),
  //       article_title: articleTitle,
  //       article_source: source,
  //     },
  //   };

  //   try {
  //     const response = await apiService.saveToExisting(token, bookmarkData);
  //     if (response.status === 201) {
  //       const updatedCollections = {
  //         ...collections,
  //         [collectionName]: [
  //           ...(collections[collectionName] || []),
  //           {
  //             article_id: String(currentIdType),
  //             article_title: articleTitle,
  //             article_source: source,
  //           },
  //         ],
  //       };
  //       setCollections(updatedCollections);
  //       localStorage.setItem("collections", JSON.stringify(updatedCollections));
  //       showSuccessToast("Added to Existing Collection");

  //       await fetchCollections(); // Refetch collections after successful addition

  //       setIsModalOpen(false);
  //     }
  //   } catch (error) {
  //     showErrorToast("Failed to Add to the collection");
  //     console.error("Error adding bookmark to existing collection:", error);
  //   }
  // };

  // const handleCreateNewCollection = async () => {
  //   if (!newCollectionName) return;
  //   const newCollection = {
  //     user_id,
  //     collection_name: newCollectionName,
  //     bookmark: {
  //       article_id: String(currentIdType), // Convert to string
  //       article_title: articleTitle,
  //       article_source: source,
  //     },
  //   };

  //   try {
  //     const response = await apiService.createNewCollection(
  //       token,
  //       newCollection
  //     );

  //     if (response.status === 201) {
  //       await fetchCollections(); // Refetch collections after successful creation
  //       setNewCollectionName("");
  //       setCollectionAction("existing");
  //       setIsModalOpen(false);
  //       handleCloseCollectionModal();
  //     }
  //     showSuccessToast("New Collection Created");
  //   } catch (error) {
  //     showErrorToast("Failed to CreateCollection");
  //     console.error("Error creating new collection:", error);
  //   }
  // };
  const handleArticleTypeFilter = (event) => {
    const { value, checked } = event.target;
    const updatedArticleTypes = checked
      ? [...filters.articleType, value]
      : filters.articleType.filter((type) => type !== value);
  
    setFilters((prev) => ({ ...prev, articleType: updatedArticleTypes }));
  
    fetchFilteredResults({
      articleTypes: updatedArticleTypes,
      subjectAreas: filters.subjectArea,
      dateRange: selectedDateRange,
      startDate: customStartDate,
      endDate: customEndDate,
      page: 1,
    });
  };
  console.log(filters)
  const handleSubjectAreaFilter = (event) => {
    const { value, checked } = event.target;
    const updatedSubjectAreas = checked
      ? [...filters.subjectArea, value]
      : filters.subjectArea.filter((area) => area !== value);
  
    setFilters((prev) => ({ ...prev, subjectArea: updatedSubjectAreas }));
  
    fetchFilteredResults({
      articleTypes: filters.articleType,
      subjectAreas: updatedSubjectAreas,
      dateRange: selectedDateRange,
      startDate: customStartDate,
      endDate: customEndDate,
      page: 1,
    });
  };
  
  const handleDateFilter = (selectedRange, start = "", end = "") => {
    setSelectedDateRange(selectedRange);
  
    // Store in filters
    setFilters((prev) => ({
      ...prev,
      dateRange: selectedRange,
      customStartDate: selectedRange === "custom" ? start : "",
      customEndDate: selectedRange === "custom" ? end : "",
    }));
  
    // Avoid early API call for custom range
    if (selectedRange === "custom" && (!start || !end)) {
      return;
    }
  
    fetchFilteredResults({
      articleTypes: filters.articleType,
      subjectAreas: filters.subjectArea,
      dateRange: selectedRange,
      startDate: selectedRange === "custom" ? start : "",
      endDate: selectedRange === "custom" ? end : "",
      page: 1,
    });
  };
  
  
  
  const fetchFilteredResults = ({
    articleTypes = [],
    subjectAreas = [],
    dateRange,
    startDate,
    endDate,
    page = page,
  }) => {
    let apiUrl = `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/all_articles?query=${encodeURIComponent(
      searchTerm
    )}&page=${page}`;
  
    // Append article types
    if (articleTypes.length > 0) {
      apiUrl += `&article_types=${encodeURIComponent(articleTypes.join(","))}`;
    }
  
    // Append subject areas
    if (subjectAreas.length > 0) {
      apiUrl += `&subject_areas=${encodeURIComponent(subjectAreas.join(","))}`;
    }
  
    // Append date filters
    if (dateRange === "1") {
      apiUrl += `&date_range=1 year`;
    } else if (dateRange === "5") {
      apiUrl += `&date_range=5 years`;
    } else if (dateRange === "custom" && startDate && endDate) {
      apiUrl += `&start_date=${startDate}&end_date=${endDate}`;
    }
  
    setLoading(true);
  
    axios
      .get(apiUrl)
      .then((res) => {
        const data = res.data;
      setLoading(false);
      dispatch(setSearchResults(data));
        setShowFilters(false);
        navigate(`/search?query=${encodeURIComponent(searchTerm)}&page=${page}`, { state: { data } });

      })
      .catch((err) => {
        console.error("API error", err);
        setResults([]);
        setLoading(false);
      });
  };
  
  
  // const handleResetAll = () => {
  //   setFilters({
  //     articleType: [],
  //     subjectArea: [],
  //     sourceType: [],
  //   });
  //   setSelectedDateRange("");
  //   setCustomStartDate("");
  //   setCustomEndDate("");
  
  //   fetchFilteredResults({
  //     articleTypes: [],
  //     subjectAreas: [],
  //     page: 1,
  //   });
  // };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`; // Format for the API
  };

  const handleSourceTypeChange = (event) => {
    const { value, checked } = event.target;
    const updatedSourceTypes = checked
      ? [...filters.sourceType, value]
      : filters.sourceType.filter((type) => type !== value);

    setFilters((prevFilters) => ({
      ...prevFilters,
      sourceType: updatedSourceTypes,
    }));
    fetchFilteredResults({
      sourceTypes: updatedSourceTypes,
      dateRange: selectedDateRange,
      startDate: customStartDate,
      endDate: customEndDate,
    });
  };
  useEffect(() => {
    const storedData = sessionStorage.getItem("AnnotateData");

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setAnnotateData(parsedData);
      } catch (error) {
        console.error(
          "Failed to parse AnnotateData from sessionStorage",
          error
        );
        setAnnotateData([]);
      }
    } else {
      setAnnotateData([]);
    }
    setOpenAnnotate(false);
  }, []);


  useEffect(() => {
    if (searchResults) {
      let articles = [];
  
      try {
        // If searchResults.body is an object, use it directly
        if (searchResults.body && typeof searchResults.body === "object") {
          articles = searchResults.body.articles || [];
        } else {
          articles = searchResults.articles || [];
        }
      } catch (error) {
        console.error("Error processing searchResults body:", error);
      }
  
      if (Array.isArray(articles)) {
        const pmidList = articles.map((article) => {
          if (article.source === "MedRxiv") {
            const bioRxiv_id = article.doi ? article.doi.split(".").pop() : "N/A";
            return `BioRxiv_${bioRxiv_id}`;
          } else if (article.source === "PLOS") {
            const plosId = article.doi ? article.doi.split(".").pop() : "N/A";
            return `PLOS_${plosId}`;
          } else if(article.source == "PubMed"){ 
            return `PubMed_${article.pmid}`;
          }
        });
  
        sessionStorage.setItem("completePMID", JSON.stringify(pmidList));
        setCompletePMID(pmidList);
      } else {
        console.warn("Articles is not an array:", articles);
      }
    } else {
      const storedData = sessionStorage.getItem("completePMID");
  
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setCompletePMID(parsedData);
      }
    }
  }, [searchResults]);
  

  useEffect(() => {
    // Clear session storage for chatHistory when the location changes
    localStorage.removeItem("chatHistory");
  }, [location]);
  const capitalizeFirstLetter = (text) => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  const italicizeTerm = (text) => {
    if (!text) return "";
    if (!searchTerm) return String(text);
    const escapeRegex = (term) =>
      term.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    const sanitizedSearchTerm = escapeRegex(searchTerm);

    if (!sanitizedSearchTerm.trim()) return String(text); // Return original text if searchTerm is invalid after escaping

    const textString = String(text);
    const regex = new RegExp(`(${sanitizedSearchTerm})`, "gi");

    return textString.split(regex).map((part, index) =>
      part.toLowerCase() === sanitizedSearchTerm.toLowerCase() ? (
        <b key={index} className="bold" style={{}}>
          <i>{part}</i>
        </b>
      ) : (
        part
      )
    );
  };

  const handleResetAll = () => {
    // Clear the filters from state
    setFilters({ articleType: [], sourceType: [],subjectArea:[] });
    setAnnotateData([]);
    setBioRxivArticles([]);
    setPlosArticles([]);
    setSelectedArticles([]);
    setShareableLinks({});
    setOpenAnnotate(false);
    setSelectedSort("best_match");
    setSelectedDateRange("");
    setCustomStartDate("");
    setCustomEndDate("");
    localStorage.removeItem("filters");
    localStorage.removeItem("publicationDate");
    setShowFilters(!showFilters);
    handleFetchResults(searchTerm, page)

  };
  const getIdType = (article) => {
    return article.source === "MedRxiv"
      ? article.doi ? article.doi.split(".").pop() : "N/A"
      : article.source === "PLOS"
      ? article.doi ? article.doi.split(".").pop() : "N/A"
      : article.pmid;
  };
  const handleNavigate = (source,url) => {
    navigate(`/article/content/?query=${encodeURIComponent(searchTerm)}&source=${source}&url=${url}`, {
      state: { data: data, searchTerm, annotateData: annotateData },
    });
  };

  const handlePageInputSubmit = () => {
    const pageNumber = parseInt(pageInput, 10);
    if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= totalPages) {
      handlePageChange(pageNumber); // Only update the page if the input is valid
    } else {
      setPageInput(currentPage); // Reset input to current page if invalid
    }
  };

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = "hidden"; // Prevent scrolling
    } else {
      document.body.style.overflow = "auto"; // Enable scrolling
    }

    return () => {
      document.body.style.overflow = "auto"; // Cleanup on unmount
    };
  }, [loading]);
  // Calculate total pages
  //const totalPages = Math.ceil(data.articles.length / ITEMS_PER_PAGE);
  const totalPages =
    1000

  const handleCheckboxChange = (pmid) => {
    setSelectedArticles(
      (prevSelected) =>
        prevSelected.includes(pmid)
          ? prevSelected.filter((id) => id !== pmid) // Remove unchecked article
          : [...prevSelected, pmid] // Add checked article
    );
  };

  const handleBioRxivBoxChange = (pmid) => {
    setBioRxivArticles(
      (prevBioRxiv) =>
        prevBioRxiv.includes(pmid)
          ? prevBioRxiv.filter((id) => id !== pmid) // Remove unchecked article from MedRxiv
          : [...prevBioRxiv, pmid] // Add checked article to MedRxiv
    );
  };
  const handlePlosBoxChange = (pmid) => {
    setPlosArticles(
      (prevPlos) =>
        prevPlos.includes(pmid)
          ? prevPlos.filter((id) => id !== pmid) // Remove unchecked article from PLOS
          : [...prevPlos, pmid] // Add checked article to PLOS
    );
  };
  const handleSourceCheckboxChange = (source, idType, doi) => {
    const sourceType = source; // Set to "PubMed" if source is null or undefined
    const uniqueId = `${sourceType}_${idType}`;
    let shareableLink;
    if (sourceType === "pubmed") {
      shareableLink = `https://pubmed.ncbi.nlm.nih.gov/${idType}`;
    } else if (sourceType === "Public Library of Science (PLOS)") {
      shareableLink = `https://journals.plos.org/plosone/article?id=${doi}`;
    } else if (sourceType === "MedRxiv") {
      shareableLink = `https://www.biorxiv.org/content/${doi}`;
    }

    // Toggle link in shareableLinks state
    setShareableLinks((prevLinks) => {
      if (prevLinks[uniqueId]) {
        // Remove the link if it already exists
        const updatedLinks = { ...prevLinks };
        delete updatedLinks[uniqueId];
        return updatedLinks;
      } else {
        // Add the link if it doesn't exist
        return {
          ...prevLinks,
          [uniqueId]: shareableLink,
        };
      }
    });

    // Call appropriate checkbox handler based on source type
    if (sourceType === "pubmed") {
      handleCheckboxChange(uniqueId);
    } else if (sourceType === "Public Library of Science (PLOS)") {
      handlePlosBoxChange(uniqueId);
    } else if (sourceType === "MedRxiv") {
      handleBioRxivBoxChange(uniqueId);
    }
  };

  const isArticleSelected = (source, idType) => {
    const uniqueId = `${source}_${idType}`; // Create unique ID for checking selection state
    if (source === "MedRxiv") {
      return bioRxivArticles.includes(uniqueId);
    } else if (source === "Public Library of Science (PLOS)") {
      return plosArticles.includes(uniqueId);
    } else if (source === "pubmed") {
      return selectedArticles.includes(uniqueId); // For other sources
    }
  };
  const handleShare = async () => {
    try {
      // Fetch notes dynamically when the Share button is clicked
      if (user_id && token) {
        await fetchNotes();
      }

      // Open the email modal after fetching notes
      setIsEmailModalOpen(true);
    } catch (error) {
      console.error("Error handling share action:", error);
    }
  };
  const handleSendEmail = async () => {
    const mailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      showErrorToast("Please enter an email address.");
      return;
    }
    if(!mailRegex.test(email)){
      showErrorToast("Please enter a valid email address.");
      return;
    }

    const links = Object.values(shareableLinks).join(" "); // Get all the URLs as a single space-separated string

    const emailData = {
      email: email,
      subject: emailSubject,
      content: description,
      noteids: selectedNote,
      urls: [links],
    };
    try {
      //const response = await apiService.shareArticle(emailData, token);
      const response = await axios.post(
        // "https://inferai.ai/api/core_search/sharearticle",
        "https://inferai.ai/api/core_search/sharearticle",
        emailData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add Bearer token
            // "ngrok-skip-browser-warning": true,
          },
        }
      );
      if (response.status === 200) {
        showSuccessToast("Email sent successfully");
        setEmail("");
        setEmailSubject("");
        setDecription("");
        handleCloseEmailModal(); // Close modal after successful email send
      }
    } catch (error) {
      console.error("Error sending email:", error);
      showErrorToast("Failed to send email. Please try again.");
    }
  };
  const handleCloseEmailModal = () => {
    setIsEmailModalOpen(false);
    setEmail("");
    setEmailSubject("");
    setDecription("");
  };

  const handleAnnotateClick = async () => {
    if (totalArticles.length > 0) {
      sessionStorage.setItem("AnnotateData", "");
      sessionStorage.setItem("AnnotateSource", "");
      setAnnotateData([]);
      setAnnotateLoading(true);
      setLoading(true);

      const extractIdType = (uniqueId) => uniqueId.split("_")[1];
      const extractIdSource = (uniqueId) => uniqueId.split("_")[0];

      const annotatedArticles = totalArticles.map((id) => ({
        source: extractIdSource(id),
        idType: extractIdType(id),
      }));

      const pubmedIds = selectedArticles.map((id) =>
        parseInt(extractIdType(id), 10)
      );
      const biorxivIds = bioRxivArticles.map((id) =>
        parseInt(extractIdType(id), 10)
      );
      const plosIds = plosArticles.map((id) => parseInt(extractIdType(id), 10));

      try {
        const response = await axios.post(
          "https://inferai.ai/api/core_search/annotate",
          {
            pubmed: pubmedIds,
            biorxiv: biorxivIds,
            plos: plosIds,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;
        sessionStorage.setItem("AnnotateData", JSON.stringify(data));
        sessionStorage.setItem(
          "AnnotateSource",
          JSON.stringify(annotatedArticles)
        );
        setAnnotateData(data);
        setAnnotateSource(annotatedArticles);
        setOpenAnnotate(true);
      } catch (error) {
        console.error("Error fetching data from the API", error);
      } finally {
        setAnnotateLoading(false);
        setLoading(false);
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevents default form submission
      handleSendEmail();
    }
  };
  const [containerHeight, setContainerHeight] = useState("auto");
  const containerRef = useRef(null);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.offsetHeight;
        setContainerHeight(`${height}px`);
      }
    };

    // Update height on mount
    updateHeight();

    // Update height on window resize
    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);
  const [isTabletView, setIsTabletView] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
console.log(isTabletView)
useEffect(() => {
  const handleResize = () => {
    const width = window.innerWidth;

    // Update mobile view state
    setIsMobileView(width < 600); // For screens smaller than 600px (mobile)

    // Update tablet view state
    setIsTabletView(width >= 600 && width < 786); // For screens between 600px and 768px (tablet)
  };

  // Set initial state
  handleResize();

  // Add event listener
  window.addEventListener("resize", handleResize);

  // Cleanup event listener
  return () => window.removeEventListener("resize", handleResize);
}, []);

  const [showFilters, setShowFilters] = useState(false);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  const mobileViewOptionsRef = useRef(null); // Reference for MobileView-Options
  const [mobileViewHeight, setMobileViewHeight] = useState(0); // State to store height

  useEffect(() => {
    if (mobileViewOptionsRef.current) {
      // Capture the height of MobileView-Options
      setMobileViewHeight(mobileViewOptionsRef.current.offsetHeight);
    }

    const handleResize = () => {
      if (mobileViewOptionsRef.current) {
        setMobileViewHeight(mobileViewOptionsRef.current.offsetHeight);
      }
    };

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div className="Container" ref={contentRightRef}>
      <SearchNavbar containerRef={containerRef} isTabletView={isTabletView} isMobileView={isMobileView}/>


      {isTabletView&&
      <>
        <FiltersTabView 
    filters={filters}
    handleResetAll={handleResetAll}
    handleDateFilter={handleDateFilter}
    setSelectedDateRange={setSelectedDateRange}
    selectedDateRange={selectedDateRange}
    customStartDate={customStartDate}
    setCustomStartDate={setCustomStartDate}
    customEndDate={customEndDate}
    setCustomEndDate={setCustomEndDate}
    handleArticleTypeFilter={handleArticleTypeFilter}
    toggleFilters={toggleFilters}
    showFilters={showFilters}
    handleSortChange={handleSortChange}
    selectedSort={selectedSort}
    data={data}
    isLoggedIn={isLoggedIn}
    selectedArticles={selectedArticles}
    displayMessage={displayMessage}
    shareableLinks={shareableLinks}
    handleShare={handleShare}
    handleSubjectAreaFilter={handleSubjectAreaFilter}
/>

      </>}
      {isMobileView&&
      <>
        <FiltersMobileView 
    filters={filters}
    handleResetAll={handleResetAll}
    handleDateFilter={handleDateFilter}
    selectedDateRange={selectedDateRange}
    customStartDate={customStartDate}
    setCustomStartDate={setCustomStartDate}
    customEndDate={customEndDate}
    setCustomEndDate={setCustomEndDate}
    handleArticleTypeFilter={handleArticleTypeFilter}
    toggleFilters={toggleFilters}
    showFilters={showFilters}
    handleSubjectAreaFilter={handleSubjectAreaFilter}
    handleSortChange={handleSortChange}
    selectedSort={selectedSort}
    data={data}
    isLoggedIn={isLoggedIn}
    selectedArticles={selectedArticles}
    setSelectedDateRange={setSelectedDateRange}
    displayMessage={displayMessage}
    shareableLinks={shareableLinks}
    handleShare={handleShare}
/>

      </>}
      <div id="Search-Content-Container" style={{width:(isTabletView||isMobileView)?"95%":"",justifyContent:isTabletView?openAnnotate?"space-between":"":"" }}>
      {!isTabletView && !isMobileView && (
          <FiltersSection 
            filters={filters}
            setFilters={setFilters}
            handleResetAll={handleResetAll}
            handleDateFilter={handleDateFilter}
            selectedDateRange={selectedDateRange}
            customStartDate={customStartDate}
            setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate}
            setCustomEndDate={setCustomEndDate}
            handleSourceTypeChange={handleSourceTypeChange}
            handleArticleTypeFilter={handleArticleTypeFilter}
            handleSubjectAreaFilter={handleSubjectAreaFilter}
            setSelectedDateRange={setSelectedDateRange}
          />
        )}
        {loading ? <Loading /> : ""}

        <div className="searchContent-right"style={{width: (isTabletView)
          ? openAnnotate
          ? "50%"
          : "100%"
          : "100%",margin:isTabletView&&"0"}} >
          {data?.body?.articles && Array.isArray(data.body.articles) ? (            <>
            {!isTabletView && !isMobileView && (<>
            <div className="SearchResult-Count-Filters">
                <div className="SearchResult-Option-Buttons">
                  <div
                    className="SearchResult-Option-Left"
                    style={{
                      cursor:
                        isLoggedIn && selectedArticles.length > 0
                          ? "pointer"
                          : "not-allowed",
                      opacity: isLoggedIn
                        ? selectedArticles.length > 0
                          ? 1
                          : 1
                        : 0.5, // Grayed out if not logged in1
                    }}
                    title={
                      isLoggedIn
                        ? selectedArticles.length === 0
                          ? "Select an article to share"
                          : "Share selected articles"
                        : displayMessage
                    }
                  >
                    <button
                      onClick={
                        isLoggedIn && Object.keys(shareableLinks).length > 0
                          ? handleShare
                          : null
                      }
                      disabled={
                        !isLoggedIn || Object.keys(shareableLinks).length === 0
                      }
                      className={`SearchResult-Share ${
                        isLoggedIn && Object.keys(shareableLinks).length > 0
                          ? "active"
                          : "disabled"
                      }`}
                      title={
                        isLoggedIn
                          ? Object.keys(shareableLinks).length === 0
                            ? "Select an article to share"
                            : "Share selected articles"
                          : displayMessage
                      }
                    >
                      Share
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "baseline",
                  }}
                >
                  <div
                    className="SearchResult-count"
                    style={{ marginRight: "15px" }}
                  >
                    <span style={{ color: "blue" }}>
                    {data?.body?.articles?.find(
  (article) => ["PubMed", "MedRxiv"].includes(article.source) && article.results
)?.results || ""}
                    </span>{" "}
                    results
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "baseline",
                      gap: "5px",
                    }}
                  >
                    <span style={{ color: "black", fontSize: "14px" }}>
                      Sort by:
                    </span>
                    <div className="SearchResult-dropdown-container">
                      <select
                        className="SearchResult-dropdown"
                        onChange={handleSortChange}
                        value={selectedSort}
                      >
                        <option value="best_match">Most Relevant</option>
                        <option value="publication_date">
                          Publication Date
                        </option>
                        <option value="Ratings">Rating</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pagination">
                <div className="pagination-controls">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    {"<<"} {/* First page button */}
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    {"<"} {/* Previous page button */}
                  </button>
                  <button
                    style={{
                      background: "none",
                      border: "1px solid",
                      padding: "0",
                    }}
                  >
                    <input
                      type="text"
                      value={
                        pageInput === "" || pageInput === "0"
                          ? pageInput
                          : String(pageInput).padStart(2, "0")
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          setPageInput(value); // Update only if it's a valid number or empty
                        }
                      }}
                      onBlur={handlePageInputSubmit} // Validate when input loses focus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handlePageInputSubmit(); // Validate when pressing Enter
                      }}
                      style={{
                        width: "35px",
                        textAlign: "center",
                        border: "none",
                        padding: "6px",
                        outline: "none",
                      }}
                    />
                  </button>

                  <span> / {totalPages}</span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    {">"} {/* Next page button */}
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    {">>"} {/* Last page button */}
                  </button>
                </div>
              </div>
              </>
              )}

              <div className="searchContent-articles">
                <div className="searchresults-list">
                  {paginatedArticles.map((result, index) => {
                    let similarityScore = result.final_score;
                    if (!similarityScore && searchResults) {
                      const articles = searchResults.body.articles;
                      // Find the article with the matching pmid in Redux store and get similarity score
                      const matchingArticle = articles.find(
                        (article) => article.pmid === result.pmid
                      );

                      if (matchingArticle) {
                        similarityScore =
                          matchingArticle.similarity_score || "N/A"; // Get similarity_score or fallback to 'N/A'
                      }
                    }

                    const idType = getIdType(result);
                    // Safely handle abstract_content based on its type
                    

                    return (
                      <div key={index} className="searchresult-item">
                        <div
                          className="searchresult-item-header"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            maxHeight: "85%",
                            overflow: "hiddden",
                          }}
                        >
                          <div className="div1">
                            <div
                              className="searchresult-title-container"
                              style={{ marginLeft: !isLoggedIn ? "17px" : "" }}
                            >
                              <div className="searchresult-ArticleTitle">
                                <input
                                  type="checkbox"
                                  className="result-checkbox"
                                  style={{
                                    display: displayIfLoggedIn,
                                    height: "14px",
                                    width: "14px",
                                    marginTop: "5px",
                                    marginLeft: 0,
                                  }}
                                  onChange={() =>
                                    handleSourceCheckboxChange(
                                      result.source,
                                      idType,
                                      result.doi
                                    )
                                  }
                                  checked={isArticleSelected(
                                    result.source,
                                    idType
                                  )} // Sync checkbox state
                                />
                                <h3 className="searchresult-title">
                                  <span
                                    className="gradient-text"
                                    onClick={() => handleNavigate(result.source,result.url)}
                                    style={{ cursor: "pointer" }}
                                  >
                                    {italicizeTerm(
                                      capitalizeFirstLetter(
                                        openAnnotate
                                          ? result.title.slice(0, 100) +
                                              (result.title.length > 100
                                                ? "..."
                                                : "")
                                          : result.title
                                      )
                                    )}
                                  </span>
                                </h3>
                              </div>
                              <FontAwesomeIcon
                                icon={
                                  isArticleBookmarked(result.url)
                                    ? solidBookmark
                                    : regularBookmark
                                }
                                size="l"
                                style={{
                                  color: isArticleBookmarked(result.url)
                                    .isBookmarked
                                    ? "#1B365D"
                                    : "black",
                                  cursor: isLoggedIn
                                    ? "pointer"
                                    : "not-allowed",
                                  opacity: isLoggedIn ? 1 : 0.5,
                                }}
                                // onClick={() =>
                                //   isLoggedIn
                                //     ? handleBookmarkClick(
                                //         idType,
                                //         result.article_title,
                                //         result.source || "PubMed"
                                //       )
                                //     : ""
                                // }
                                title={
                                  isLoggedIn
                                    ? isArticleBookmarked(result.url)
                                      ? `Bookmarked in ${isArticleBookmarked(result.url).collectionName}`
                                      : "Bookmark this article"
                                    : displayMessage
                                }
                              />
  
                              {isEmailModalOpen && (
                                <div
                                  className="email-modal-overlay"
                                  style={{
                                    background: "rgba(0, 0, 0, 0.1)",
                                  }}
                                  onClick={handleCloseEmailModal}
                                >
                                  <div
                                    className="email-modal-content"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      background: "rgba(255, 255, 255, 1)",
                                      width: isMobileView?"90%":"65%",
                                    }}
                                  >
                                    <div className="email-modal-header">
                                      <h3>Share with</h3>
                                      <div className="search-wrapper-notes">
                                        <img
                                          src={SearchIcon}
                                          alt="search"
                                          className="search-icon-notes"
                                          style={{ padding: "2px" }}
                                        />
                                        <input
                                          type="text"
                                          value={searchQuery}
                                          onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                          }
                                          placeholder="Search notes..."
                                          className="note-search-input"
                                          style={{
                                            width: "100%",
                                            padding: "10px 8px 8px 20px",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                            fontSize: "14px",
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <div
                                      className="share-notes-modal"
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: "20px",
                                      }}
                                    >
                                      <div
                                        className="notes-radio"
                                        style={{
                                          // display: "grid",
                                          width: "50%",
                                          height: "40vh",
                                          overflow: "auto",
                                        }}
                                      >
                                        {filteredNotes?.length > 0 ? (
                                          filteredNotes.map((note) => (
                                            <div
                                              key={note.note_id}
                                              className="note-item-selection"
                                              style={{
                                                display: "flex",
                                                alignItems: "center",
                                              }}
                                            >
                                              <input
                                                type="checkbox"
                                                value={note.note_id}
                                                checked={
                                                  note.id &&
                                                  selectedNote.includes(note.id)
                                                }
                                                onChange={() => {
                                                  if (note.note_id) {
                                                    setSelectedNote(
                                                      (prevSelected) =>
                                                        prevSelected.includes(
                                                          note.note_id
                                                        )
                                                          ? prevSelected.filter(
                                                              (id) =>
                                                                id !==
                                                                note.note_id
                                                            )
                                                          : [
                                                              ...prevSelected,
                                                              note.note_id,
                                                            ]
                                                    );
                                                  } else {
                                                    console.warn(
                                                      "Note ID is undefined:",
                                                      note
                                                    );
                                                  }
                                                }}
                                              />
                                              <NoteItem
                                                note={note}
                                                onEdit={() => {}}
                                                onDelete={() => {}}
                                                isOpenNotes={false}
                                                minimalView={true}
                                                customStyles={{
                                                  height: "4vh",
                                                  width: "100%",
                                                }}
                                                isMobileView={isMobileView}
                                              />
                                            </div>
                                          ))
                                        ) : (
                                          <p>No notes available</p>
                                        )}
                                      </div>
                                      <div
                                        className="email-modal-body"
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          width: "50%",
                                        }}
                                      >
                                        <label
                                          htmlFor="email"
                                          aria-required="true"
                                          id="label-text"
                                        >
                                          Email ID
                                        </label>
                                        
                                        <input
                                          type="email"
                                          value={email}
                                          onChange={(e) =>
                                            setEmail(e.target.value)
                                          }
                                          required
                                          placeholder="Email ID"
                                          id="email-input"
                                          onKeyDown={handleKeyDown}
                                        />
                                        <label
                                          htmlFor="subject"
                                          aria-required="true"
                                          id="label-text"
                                        >
                                          Subject
                                        </label>
                                        <input
                                          type="text"
                                          value={emailSubject}
                                          onChange={(e) =>
                                            setEmailSubject(e.target.value)
                                          }
                                          required
                                          placeholder="Subject"
                                          id="email-input"
                                          onKeyDown={handleKeyDown}
                                        />
                                        <label
                                          htmlFor="subject"
                                          aria-required="true"
                                          id="label-text"
                                        >
                                          Description(optional)
                                        </label>
                                        <textarea
                                          type="text"
                                          value={description}
                                          onChange={(e) =>
                                            setDecription(e.target.value)
                                          }
                                          required
                                          placeholder="Enter Description"
                                          id="description-input"
                                          onKeyDown={handleKeyDown}
                                        />
                                      </div>
                                    </div>
                                    <div className="confirm-buttons">
                                      <button
                                        onClick={handleCloseEmailModal}
                                        style={{
                                          borderRadius: "30px",
                                          backgroundColor:
                                            "rgba(234, 234, 236, 1)",
                                          color: "rgba(78, 78, 86, 1)",
                                        }}
                                        className="cancel-button"
                                      >
                                        cancel
                                      </button>
                                      <button
                                        onClick={handleSendEmail}
                                        style={{
                                          borderRadius: "30px",
                                          width: isMobileView?"":"",
                                          padding: isMobileView&&"10px 20px"
                                          // margin: "auto",
                                        }}
                                        className="send-button"
                                      >
                                        Send
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="searchresult-authors">
                              
                                <span className="author-name">{result.authors}</span>
                            </div>
                            <p className="searchresult-published"><span style={{color:"rgb(192, 86, 0)"}}>Published on: </span> {result.date}</p>
                            <div className="searchresult-ID">
                              <p className="searchresult-pmid"><span style={{color:"rgb(192, 86, 0)"}}>ID: </span>{idType}</p>
                            </div>
                            
                          </div>
                        </div>
                        <div
                          className="Article-Options"
                          style={{ justifyContent: "space-between" }}
                        >
                          <div className="Article-Options-Left">
                            <p className="searchresult-similarity_score">
                              <span style={{ color: "#c05600" }}>
                                Relevancy Score:{" "}
                              </span>
                              {similarityScore
                                ? `${similarityScore.toFixed(2)*100}%`
                                : "N/A"}
                            </p>
                            <p className="searchresult-similarity_score">
                              <span style={{ color: "#c05600" }}>Source: </span>
                              {result.source ? result.source : "PubMed"}
                            </p>
                          </div>
                          <div className="searchResult-rate rate-tooltip">
                            {[1, 2, 3, 4, 5].map((value) => {
                            const fullStars = Math.floor(result.average_rating); // Fully filled stars
                            const partialStar = result.average_rating - fullStars; // Decimal part (e.g., 0.3 for 4.3)

                            return (
                              <span key={value} className="star-container">
                                {/* Full star */}
                                {value <= fullStars ? (
                                  <span className="full-star">★</span>
                                ) : value === fullStars + 1 && partialStar > 0 ? (
                                  // Partial star (fill based on decimal)
                                  <span className="partial-star">
                                    <span className="filled" style={{ width: `${partialStar * 100}%` }}>★</span>
                                    <span className="empty">★</span>
                                  </span>
                                ) : (
                                  // Empty star
                                  <span className="rating-empty">★</span>
                                )}
                              </span>
                            );
                          })}
                          <span className="tooltip-text">{result.average_rating.toFixed(1)} out of 5</span>
                        </div>  
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pagination">
                <div className="pagination-controls">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    {"<<"}
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    {"<"}
                  </button>
                  <button
                    style={{
                      background: "none",
                      border: "1px solid",
                      padding: "0",
                    }}
                  >
                    <input
                      type="text"
                      value={
                        pageInput === "" || pageInput === "0"
                          ? pageInput
                          : String(pageInput).padStart(2, "0")
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          setPageInput(value);
                        }
                      }}
                      onBlur={handlePageInputSubmit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handlePageInputSubmit();
                      }}
                      style={{
                        width: "35px",
                        textAlign: "center",
                        border: "none",
                        padding: "6px",
                        outline: "none",
                      }}
                    />
                  </button>

                  <span> / {totalPages}</span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    {">"}
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    {">>"}
                  </button>
                </div>
              </div>
            </>
          ) : (
           !loading && <div className="data-not-found-container">
              <div className="data-not-found">
                <h2>Data Not Found</h2>
                <p>
                  We couldn't find any data matching your search. Please try
                  again with different keywords.
                </p>
              </div>
            </div>
          )}
        </div>

        
          {!isMobileView&&<div className="search-right-aside" style={{ width:isTabletView?openAnnotate?"46%":"":"" ,top: containerHeight, position:isTabletView?openAnnotate?"unset":"":"" }}>
            {openAnnotate && (  
              <div className="search-annotate" style={{width:isTabletView?"100%":"",margin:isTabletView?"0":""}}>
                <Annotation
                  openAnnotate={openAnnotate}
                  annotateData={annotateData}
                  source={annotateSource}
                  isTabletView={isTabletView}
                />
              </div>
            )}
            {!isTabletView&&!isMobileView&&(<div className="search-icons-group">
              <>
                <div
                  className={`search-annotate-icon ${
                    openAnnotate ? "open" : "closed"
                  }${
                    isLoggedIn &&
                    (!annotateData || Object.keys(annotateData).length === 0)
                      ? "disabled"
                      : ""
                  } 
                   
                  `}
                  onClick={() => {
                    if (!isLoggedIn) {
                      return; // Prevent action if not logged in
                    }
                    setHandleAnnotateCall(true);
                    if (annotateData && Object.keys(annotateData).length > 0) {
                      handleAnnotate();
                    } else if (totalArticles.length > 0) {
                      handleAnnotateClick();
                    }
                  }}
                  title={isLoggedIn ? "" : displayMessage}
                  style={{
                    cursor: isLoggedIn
                      ? annotateData && Object.keys(annotateData).length > 0
                        ? "pointer"
                        : totalArticles.length > 0
                        ? "pointer"
                        : "default"
                      : "not-allowed", // Disable interaction if not logged in
                    opacity: isLoggedIn
                      ? annotateData && Object.keys(annotateData).length > 0
                        ? 1
                        : totalArticles.length > 0
                        ? 1
                        : 0.5
                      : 0.5, // Grayed out if not logged in
                  }}
                >
                  <img src={annotate} alt="annotate-icon" />
                </div>
              </>
            </div>)}
          </div>}
        
      </div>

      <Footer />
      <div className="ScrollTop">
        <button onClick={scrollToTop} id="scrollTopBtn" title="Go to top">
          <FontAwesomeIcon icon={faAnglesUp} />
          
        </button>
      </div>
      {isMobileView&&
      <div style={{position:"sticky",bottom:"0"}}>
        <div ref={mobileViewOptionsRef} className="MobileView-Options"> 
            <div className="HomeIcon-MobileView" style={{width:"33.33%"}}>
            <img src={homeIcon} alt="Home"  style={{ cursor: "pointer" }}  onClick={() => navigate("/")} />              
            {/* Home */}
              </div>
            <div
                          className="SearchResult-Option-Left"
                          style={{
                            width:"33.33%",
                            cursor:
                              isLoggedIn && selectedArticles.length > 0
                                ? "pointer"
                                : "not-allowed",
                            opacity: isLoggedIn
                              ? selectedArticles.length > 0
                                ? 1
                                : 0.5
                              : 0.5, // Grayed out if not logged in1
                              
                          }}
                          title={
                            isLoggedIn
                              ? selectedArticles.length === 0
                                ? "Select an article to share"
                                : "Share selected articles"
                              : displayMessage
                          }
                        >
                          <button
                            onClick={
                              isLoggedIn && Object.keys(shareableLinks).length > 0
                                ? handleShare
                                : null
                            }
                            disabled={
                              !isLoggedIn || Object.keys(shareableLinks).length === 0
                            }
                            style={{border:"none",background:"none"}}
                            className={`SearchResult-Share ${
                              isLoggedIn && Object.keys(shareableLinks).length > 0
                                ? "active"
                                : "disabled"
                            }`}
                            title={
                              isLoggedIn
                                ? Object.keys(shareableLinks).length === 0
                                  ? "Select an article to share"
                                  : "Share selected articles"
                                : displayMessage
                            }
                          >
<PiShareNetwork color="#007bff" size={23}/>                            {/* Share */}
                          </button>
                          {/* {!isLoggedIn && (
          <p style={{ color: "gray", fontSize: "0.9rem", marginTop: "5px" }}>
            {displayMessage}
          </p>
        )} */}
            </div>
            <div className="search-icons-group" style={{width:"33.33%"}}>
                  <>
                    <div
                      className={`search-annotate-icon ${
                        openAnnotate ? "open" : "closed"
                      }${
                        isLoggedIn &&
                        (!annotateData || Object.keys(annotateData).length === 0)
                          ? "disabled"
                          : ""
                      } 
                      
                      `}
                      onClick={() => {
                        if (!isLoggedIn) {
                          return; // Prevent action if not logged in
                        }
                        setHandleAnnotateCall(true);
                        if (annotateData && Object.keys(annotateData).length > 0) {
                          handleAnnotate();
                        } else if (totalArticles.length > 0) {
                          handleAnnotateClick();
                        }
                      }}
                      title={isLoggedIn ? "" : displayMessage}
                      style={{
                        cursor: isLoggedIn
                          ? annotateData && Object.keys(annotateData).length > 0
                            ? "pointer"
                            : totalArticles.length > 0
                            ? "pointer"
                            : "default"
                          : "not-allowed", // Disable interaction if not logged in
                        opacity: isLoggedIn
                          ? annotateData && Object.keys(annotateData).length > 0
                            ? 1
                            : totalArticles.length > 0
                            ? 1
                            : 0.5
                          : 0.5, // Grayed out if not logged in
                          background:"none"
                      }}
                    >
                      <img src={annotate} alt="annotate-icon" />
                    </div>
                  </>
              </div>
              {isMobileView&&<div className="search-right-aside-mobile" style={{ position: "absolute",
            bottom: `${mobileViewHeight + 10}px`,right:"2px",width:isTabletView?openAnnotate?"46%":"":"" }}>
                {openAnnotate && (  
                  <div className="search-annotate" style={{width:isMobileView?"99vw":"",margin:isMobileView ?"0":""}}>
                    <Annotation
                      openAnnotate={openAnnotate}
                      annotateData={annotateData}
                      source={annotateSource}
                      isTabletView={isTabletView}
                    />
                  </div>
                )}
                {!isTabletView&&!isMobileView&&(<div className="search-icons-group">
                  <>
                    <div
                      className={`search-annotate-icon ${
                        openAnnotate ? "open" : "closed"
                      }${
                        isLoggedIn &&
                        (!annotateData || Object.keys(annotateData).length === 0)
                          ? "disabled"
                          : ""
                      } 
                      
                      `}
                      onClick={() => {
                        if (!isLoggedIn) {
                          return; // Prevent action if not logged in
                        }
                        setHandleAnnotateCall(true);
                        if (annotateData && Object.keys(annotateData).length > 0) {
                          handleAnnotate();
                        } else if (totalArticles.length > 0) {
                          handleAnnotateClick();
                        }
                      }}
                      title={isLoggedIn ? "" : displayMessage}
                      style={{
                        cursor: isLoggedIn
                          ? annotateData && Object.keys(annotateData).length > 0
                            ? "pointer"
                            : totalArticles.length > 0
                            ? "pointer"
                            : "default"
                          : "not-allowed", // Disable interaction if not logged in
                        opacity: isLoggedIn
                          ? annotateData && Object.keys(annotateData).length > 0
                            ? 1
                            : totalArticles.length > 0
                            ? 1
                            : 0.5
                          : 0.5, // Grayed out if not logged in
                      }}
                    >
                      <img src={annotate} alt="annotate-icon" />
                    </div>
                  </>
                </div>)}
              </div>}
          </div>
        </div>}
      </div>
  );
};

export default SearchResults;