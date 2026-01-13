import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API as api } from "../api/axios";
import toast from "react-hot-toast";

const initialState = {
  reservations: [],
  reservation: null,
  loading: false,
  error: null,
};

// --- Thunks ---

export const fetchReservations = createAsyncThunk(
  "reservation/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/reservation");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch reservations");
    }
  }
);

export const fetchReservation = createAsyncThunk(
  "reservation/fetch",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reservation/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch reservation");
    }
  }
);

export const createReservation = createAsyncThunk(
  "reservation/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/reservation", data);
      toast.success("Reservation created successfully");
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create reservation";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateReservation = createAsyncThunk(
  "reservation/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/reservation/${id}`, data);
      toast.success("Reservation updated successfully");
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Update failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteReservation = createAsyncThunk(
  "reservation/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/reservation/${id}`);
      toast.success("Reservation removed");
      return id;
    } catch (error) {
      const message = error.response?.data?.message || "Delete failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// --- Slice ---

const reservationSlice = createSlice({
  name: "reservation",
  initialState,
  reducers: {
    clearReservationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. Specific Cases
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = action.payload;
      })
      .addCase(fetchReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.reservation = action.payload;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations.push(action.payload);
      })
      .addCase(updateReservation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reservations.findIndex((res) => res.id === action.payload.id);
        if (index !== -1) state.reservations[index] = action.payload;
      })
      .addCase(deleteReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = state.reservations.filter((res) => res.id !== action.payload);
      })
      // 2. Generic Matchers
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
          state.error = action.payload || "An unexpected error occurred";
        }
      );
  },
});

export const { clearReservationError } = reservationSlice.actions;
export default reservationSlice.reducer;