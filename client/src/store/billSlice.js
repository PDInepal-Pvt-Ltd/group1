import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API as api } from "../api/axios";
import toast from "react-hot-toast";

const initialState = {
  bills: [],
  selectedBill: null,
  dailyReport: null,
  loading: false,
  error: null,
};

// --- Thunks ---

export const fetchBills = createAsyncThunk(
  "bill/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/bill");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch bills");
    }
  }
);

export const createBill = createAsyncThunk(
  "bill/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/bill", data);
      toast.success(response.data.message || "Bill generated successfully");
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to generate bill";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const payBill = createAsyncThunk(
  "bill/pay",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/bill/${id}/pay`);
      toast.success("Payment recorded successfully");
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Payment failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchDailyReport = createAsyncThunk(
  "bill/dailyReport",
  async (date, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bill/daily-report?date=${date}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch report");
    }
  }
);

// --- Slice ---

const billSlice = createSlice({
  name: "bill",
  initialState,
  reducers: {
    setSelectedBill: (state, action) => {
      state.selectedBill = action.payload;
    },
    clearBillError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = action.payload;
      })
      .addCase(createBill.fulfilled, (state, action) => {
        state.loading = false;
        state.bills.unshift(action.payload);
      })
      .addCase(payBill.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bills.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) state.bills[index] = action.payload;
        if (state.selectedBill?.id === action.payload.id) {
          state.selectedBill = action.payload;
        }
      })
      .addCase(fetchDailyReport.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyReport = action.payload;
      })
      // Generic matchers for loading and errors
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
          state.error = action.payload || "An error occurred";
        }
      );
  },
});

export const { setSelectedBill, clearBillError } = billSlice.actions;
export default billSlice.reducer;