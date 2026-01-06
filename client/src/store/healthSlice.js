import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API as api } from "../api/axios";


const initialState = {
  status: null,
  loading: false,
  error: null,
  lastChecked: null,
};

// --- Thunks ---

export const checkSystemHealth = createAsyncThunk(
  "health/check",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/health-check");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || "Health check failed");
    }
  },
  {
    condition: (_, { getState }) => {
      const { health } = getState();
      if (health.loading) {
        return false;
      }
    },
  }
);

// --- Slice ---

const healthSlice = createSlice({
  name: "health",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkSystemHealth.pending, (state) => {
        if (!state.status) state.loading = true;
        state.error = null;
      })
      .addCase(checkSystemHealth.fulfilled, (state, action) => {
        state.status = action.payload;
        state.loading = false;
        state.error = null;
        state.lastChecked = Date.now();
      })
      .addCase(checkSystemHealth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Health check failed";
      });
  },
});

export default healthSlice.reducer;