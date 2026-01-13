import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API as api } from "../api/axios";


const initialState = {
  logs: [],
  selectedLog: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 50,
  },
};

// --- Thunks ---

// GET /api/auditlog - Fetch all logs (with optional query params)
export const fetchAuditLogs = createAsyncThunk(
  "auditLog/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get("/auditlog", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch audit logs");
    }
  }
);

// GET /api/auditlog/user/{id} - Fetch logs for a specific user
export const fetchUserAuditLogs = createAsyncThunk(
  "auditLog/fetchByUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/auditlog/user/${userId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user logs");
    }
  }
);

// GET /api/auditlog/{id} - Get specific log details
export const fetchAuditLogById = createAsyncThunk(
  "auditLog/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/auditlog/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Log not found");
    }
  }
);

// --- Slice ---

const auditLogSlice = createSlice({
  name: "auditLog",
  initialState,
  reducers: {
    clearSelectedLog: (state) => {
      state.selectedLog = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.data;
        if (action.payload.meta) {
          state.pagination = action.payload.meta;
        }
      })
      .addCase(fetchUserAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(fetchAuditLogById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedLog = action.payload;
      })
      // Matchers
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearSelectedLog } = auditLogSlice.actions;
export default auditLogSlice.reducer;