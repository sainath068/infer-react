import axios from "axios";
import { showErrorToast } from "../../utils/toastHelper";
import { hideNetworkErrorToast } from "../../utils/toastHelper";
import { showNetworkErrorToast } from "../../utils/toastHelper";
import { redirectToLogin } from "../../helpers/navigationHelper";

let isNetworkErrorDisplayed = false;

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const apiClient = axios.create({
  baseURL: "https://inferai.ai/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    hideNetworkErrorToast();
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, config } = error.response;
      if (status === 401 && config.url.includes("auth/login")) {
        error.reason = "invalid_credentials";
      } else if (status === 401) {
        error.reason = "session_expired";
        redirectToLogin();
      } else if (status === 404 && status === 500) {
        showErrorToast("Resource not found.");
      }
      if (status === 403) {
        error.reason = "access_denied";
      }
      // else {
      //   showErrorToast(data?.message || "An error occurred.");
      // }
    } else if (error.request) {
      if (!isNetworkErrorDisplayed) {
        isNetworkErrorDisplayed = true;
        debounce(() => {
          showNetworkErrorToast("Network error. Please check your connection.");

          isNetworkErrorDisplayed = false;
        }, 2000)();
      }
    } else {
      showErrorToast(error.message);
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  login: (email, password) =>
    apiClient.post(
      `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/auth`,
      {
        email,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    ),

  logout: (user_id) => apiClient.post(`auth/logout?user_id=${user_id}`),
  loginProfile: (user_id) =>
    apiClient.get(
      `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/user?user_id=${user_id}`,
      {
        headers: {
          //Authorization: `Bearer ${token}`,
        },
      }
    ),
  fetchNotes: (userId, token) =>
    apiClient.get(
      `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/Notes?user_id=${userId}`,
      {
        headers: {
          //Authorization: `Bearer ${token}`,
        },
      }
    ),
  deleteNote: (userId, noteId) =>
    apiClient.delete(
      `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/Notes?user_id=${userId}&note_id=${noteId}`,
      {
        headers: {
          // Authorization: `Bearer ${token}`,
        },
      }
    ),
  saveNote: (userId, title, content) =>
    apiClient.post(
      `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/Notes`,
      {
        user_id: userId,
        title: title,
        content: content,
      },
      {
        headers: {
          //Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    ),
  updateNote: (user_id, title, content, note_id) =>
    apiClient.put(
      `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/Notes`,
      {
        user_id,
        title,
        content,
        note_id,
      },
      {
        headers: {
          //Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    ),
  sendEmail: (requestData) =>
    apiClient.post(
      `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/Notes`,
      requestData,
      {
        headers: {
          //Authorization: `Bearer ${token}`,
        },
      }
    ),
  searchTerm: (searchQuery, page) =>
    apiClient.get(
      `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/all_articles`,
      {
        params: {
          query: searchQuery,
          page: page,
        },
        headers: {
          // Authorization: `Bearer ${token}`,
        },
      }
    ),
  fetchUserDetails: (user_id) =>
    apiClient.get(
      `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/user?user_id=${user_id}`,
      {
        headers: {
          //Authorization: `Bearer ${token}`,
        },
      }
    ),
  imageUpdate: (user_id, formData) =>
    apiClient.post(
      `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/user?user_id=${user_id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    ),
  saveDetails: (user_id, admin_id, requestBody) =>
    apiClient.put(
      `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/edit?admin_id=${admin_id}&user_id=${user_id}`,
      requestBody,
      {
        headers: {
          //Authorization: `Bearer ${token}`,
        },
      }
    ),
  annotateFile: (formData) => {
    return apiClient.post(
      "https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/annotations",
      formData,
      {
        headers: {
          //Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
  generateCitations: (formData) => {
    return apiClient.post(
      "https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/citations",
      formData,
      {
        headers: {
          //Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Ensure content type is set for file upload
        },
      }
    );
  },
  fetchCollections: (user_id) =>
    apiClient.get(
      `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/bookmarks?user_id=${user_id}`,
      {
        headers: {
          // Authorization: `Bearer ${token}`,
        },
      }
    ),
  fetchRatedArticles: (user_id) =>
    apiClient.get(
      `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/ratings?user_id=${user_id}`,
      {
        headers: {
          //Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    ),
  // Article page apis
  fetchArticleData: (id, source, token) =>
    apiClient.get(`view_article/get_article/${id}?source=${source}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  ratingChange: (user_id, article_source, rating, article_id, token) =>
    apiClient.post(
      `/rating/rate`,
      {
        user_id,
        rating_data: { article_id, rating, article_source },
      },
      { headers: { Authorization: `Bearer ${token}` } }
    ),
  bookmarkClick: (user_id, collectionName, idType, token) =>
    apiClient.delete(
      `bookmarks/users/${user_id}/collections/${collectionName}/${idType}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),
  saveToExisting: (token, bookmarkData) =>
    apiClient.post(`bookmarks/users/collections`, bookmarkData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  fetchChatSessions: (user_id, token) =>
    apiClient.get(`/history/conversations/history/${user_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  fetchChatConversation: (user_id, session_id, token) =>
    apiClient.get(`/history/conversations/history/${user_id}/${session_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  editChatSessionTitle: (user_id, session_id, new_title, token) =>
    apiClient.put(
      `/history/conversations/edit`,
      { user_id, session_id, new_title },
      { headers: { Authorization: `Bearer ${token}` } }
    ),

  annotateArticle: (requestBody) =>
    apiClient.post(
      `https://lfaxil11nf.execute-api.ap-south-1.amazonaws.com/source/annotations`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
        //headers: { Authorization: `Bearer ${token}` },
      }
    ),

  askChat: (bodyData, token) =>
    apiClient.post(`/view_article/generateanswer`, bodyData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }),

  deriveInsights: (formData, token, storedSessionId) => {
    const url = storedSessionId ? `/insights/ask` : `/insights/upload`;
    return apiClient.post(url, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  createNewCollection: (token, newCollection) =>
    apiClient.post(`bookmarks/users/collections`, newCollection, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  annotateClick: (token) =>
    apiClient.post(`core_search/annotate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  fetchSessions: (user_id, token) =>
    apiClient.get(`history/conversations/history/${user_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  deleteSession: (token, user_id, session_id) =>
    apiClient.delete(`history/conversations/delete/${user_id}/${session_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  saveEdit: (token, { user_id, session_id, new_title }) =>
    apiClient.put(
      `history/conversations/edit`,
      {
        user_id,
        session_id,
        new_title,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),

  sessionClick: (user_id, session_id, token) =>
    apiClient.get(`history/conversations/history/${user_id}/${session_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  // Search Results page

  // landing page

  //Article Layout
  annotateFileFromURL: (token, { url }) =>
    apiClient.post(
      `core_search/annotate_from_url`,
      {
        url,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),

  shareArticle: (token, emailData) =>
    apiClient.post(`core_search/sharearticle`, emailData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};
