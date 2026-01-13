import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API as api } from "../api/axios";
import toast from "react-hot-toast";

const initialState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
};

// --- Thunks ---

export const fetchMenuItems = createAsyncThunk(
  "menuItem/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/menu-item");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch menu items");
    }
  }
);

export const createMenuItem = createAsyncThunk(
  "menuItem/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/menu-item", formData);
      toast.success("Item created successfully");
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Creation failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateMenuItem = createAsyncThunk(
  "menuItem/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/menu-item/${id}`, data);
      toast.success("Item updated successfully");
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Update failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteMenuItem = createAsyncThunk(
  "menuItem/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/menu-item/${id}`);
      toast.success("Item deleted");
      return id;
    } catch (error) {
      const message = error.response?.data?.message || "Delete failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateMenuItemImage = createAsyncThunk(
  "menuItem/updateImage",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/menu-item/${id}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Image updated");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Image upload failed");
    }
  }
);

// --- Slice ---

const menuItemSlice = createSlice({
  name: "menuItem",
  initialState,
  reducers: {
    selectItem: (state, action) => {
      state.selectedItem = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. Standard Case handlers
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(createMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })

      // 2. Multi-action Matcher for updates
      .addMatcher(
        (action) =>
          action.type.endsWith("/update/fulfilled") ||
          action.type.endsWith("/updateImage/fulfilled"),
        (state, action) => {
          state.loading = false;
          const index = state.items.findIndex((item) => item.id === action.payload.id);
          if (index !== -1) state.items[index] = action.payload;
          if (state.selectedItem?.id === action.payload.id) {
            state.selectedItem = action.payload;
          }
        }
      )
      // 3. Status Matchers
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

export const { selectItem } = menuItemSlice.actions;
export default menuItemSlice.reducer;