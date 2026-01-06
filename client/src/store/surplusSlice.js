import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API as api } from "../api/axios";
import toast from "react-hot-toast";

const initialState = {
    marks: [],
    dailySpecials: [],
    loading: false,
    error: null,
};

// --- Thunks ---

// GET /api/surplus - Fetches active daily specials
export const fetchDailySpecials = createAsyncThunk(
    "surplus/fetchDaily",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/surplus");
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch specials");
        }
    }
);

// POST /api/surplus - Create a new surplus mark
export const createSurplusMark = createAsyncThunk(
    "surplus/create",
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post("/surplus", data);
            toast.success(response.data.message || "Surplus mark created");
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || "Failed to create surplus";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// PUT /api/surplus/{id} - Update a surplus mark
export const updateSurplusMark = createAsyncThunk(
    "surplus/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/surplus/${id}`, data);
            toast.success("Surplus updated");
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || "Update failed";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// DELETE /api/surplus/{id} - Delete a surplus mark
export const deleteSurplusMark = createAsyncThunk(
    "surplus/delete",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/surplus/${id}`);
            toast.success("Surplus mark removed");
            return id;
        } catch (error) {
            const message = error.response?.data?.message || "Delete failed";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// --- Slice ---

const surplusSlice = createSlice({
    name: "surplus",
    initialState,
    reducers: {
        clearSurplusError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Handling Daily Specials (The "Customer View")
            .addCase(fetchDailySpecials.fulfilled, (state, action) => {
                state.loading = false;
                state.dailySpecials = action.payload;
            })
            // Handling Management (The "Admin/Waiter View")
            .addCase(createSurplusMark.fulfilled, (state, action) => {
                state.loading = false;
                state.marks.unshift(action.payload);
            })
            .addCase(updateSurplusMark.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.marks.findIndex((m) => m.id === action.payload.id);
                if (index !== -1) state.marks[index] = action.payload;
            })
            .addCase(deleteSurplusMark.fulfilled, (state, action) => {
                state.loading = false;
                state.marks = state.marks.filter((m) => m.id !== action.payload);
                // Also remove from specials if present
                state.dailySpecials = state.dailySpecials.filter((s) => s.id !== action.payload);
            })
            // Generic Matchers
            .addMatcher((action) => action.type.endsWith("/pending"), (state) => {
                state.loading = true;
                state.error = null;
            })
            .addMatcher((action) => action.type.endsWith("/rejected"), (state, action) => {
                state.loading = false;
                state.error = action.payload || "An unexpected error occurred";
            });
    },
});

export const { clearSurplusError } = surplusSlice.actions;
export default surplusSlice.reducer;