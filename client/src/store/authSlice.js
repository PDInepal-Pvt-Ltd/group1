import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API as api } from "../api/axios";
import toast from "react-hot-toast";

const initialState = {
  user: null,
  loading: false,
  error: null,
};

// --- Thunks ---

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/user", data);
      toast.success(response.data.message);
      return response.data.data.user;
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/login", data);
      const { accessToken,refreshToken, user } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      toast.success(response.data.message);
      return user;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/forgot-password", data);
      toast.success(response.data.message || "Reset link sent to email");
    } catch (error) {
      const message = error.response?.data?.message || "Action failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/user/reset-password/${token}`, data);
      toast.success(response.data.message || "Password updated successfully");
    } catch (error) {
      const message = error.response?.data?.message || "Reset failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const refreshSession = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/refresh");
      const { accessToken } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      return accessToken;
    } catch (error) {
      return rejectWithValue("Session expired");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/user/${id}`, data);
      toast.success("Profile updated successfully");
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Update failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (refreshToken, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/logout", { refreshToken });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      toast.success(response.data.message || "Logged out successfully");
    } catch (error) {
      const message = error.response?.data?.message || "Logout failed";
      return rejectWithValue(message);
    }
  }
);

export const getMe = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user/me");
      return response.data.data;
    } catch (error) {
      return rejectWithValue("Session expired");
    }
  }
);

// --- Slice ---

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMe.rejected, (state) => {
        state.user = null;
        localStorage.removeItem("accessToken");
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/fulfilled"),
        (state, action) => {
          state.loading = false;
          if (
            action.type.includes("login") ||
            action.type.includes("register") ||
            action.type.includes("getMe")
          ) {
            state.user = action.payload;
          }
          if (action.type.includes("logout")) {
            state.user = null;
          }
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          if (!action.type.includes("getMe")) {
            state.error = action.payload || "An unknown error occurred";
          }
        }
      );
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;