import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API as api } from "../api/axios";
import toast from "react-hot-toast";

const initialState = {
  queue: [],
  orderTimeline: [],
  performance: null,
  loading: false,
  error: null,
};

// --- Thunks ---

// GET /api/kds/queue - Active kitchen orders
export const fetchKdsQueue = createAsyncThunk(
  "kds/fetchQueue",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/kds/queue");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch kitchen queue");
    }
  }
);

// POST /api/kds/status - Transition order status (Start Cooking, Ready, etc.)
export const transitionOrderStatus = createAsyncThunk(
  "kds/transitionStatus",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/kds/status", payload);
      toast.success(response.data.message || `Order ${payload.status}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Status transition failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// GET /api/kds-event/order/{orderId} - Get timeline
export const fetchOrderTimeline = createAsyncThunk(
  "kds/fetchTimeline",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/kds-event/order/${orderId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch timeline");
    }
  }
);

// GET /api/kds/performance - Efficiency reports
export const fetchKdsPerformance = createAsyncThunk(
  "kds/fetchPerformance",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/kds/performance");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch metrics");
    }
  }
);

// --- Slice ---

const kdsSlice = createSlice({
  name: "kds",
  initialState,
  reducers: {
    clearKdsTimeline: (state) => {
      state.orderTimeline = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKdsQueue.fulfilled, (state, action) => {
        state.loading = false;
        state.queue = action.payload;
      })
      .addCase(transitionOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload;
        const index = state.queue.findIndex((o) => o.id === updatedOrder.id);

        // If status is final, remove from kitchen queue
        if (["COMPLETED", "CANCELLED", "SERVED"].includes(updatedOrder.status)) {
          state.queue = state.queue.filter((o) => o.id !== updatedOrder.id);
        } else if (index !== -1) {
          state.queue[index] = updatedOrder;
        } else {
          state.queue.push(updatedOrder);
        }
      })
      .addCase(fetchOrderTimeline.fulfilled, (state, action) => {
        state.loading = false;
        state.orderTimeline = action.payload;
      })
      .addCase(fetchKdsPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.performance = action.payload;
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

export const { clearKdsTimeline } = kdsSlice.actions;
export default kdsSlice.reducer;