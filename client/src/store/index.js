import { configureStore as ConfigureStore, combineReducers } from "@reduxjs/toolkit"
import authReducer from "../store/authSlice"
import categoryReducer from "../store/categorySlice";
import menuItemReducer from "../store/menuItemSlice";
import tableReducer from "../store/tableSlice";
import reservationReducer from "../store/reservationSlice";
import orderReducer from "../store/orderSlice";
import allergenReducer from "../store/allergenSlice";
import menuItemAllergenReducer from "../store/menuItemAllergenSlice";
import billReducer from "../store/billSlice";
import surplusReducer from "../store/surplusSlice";
import kdsReducer from "../store/kdsSlice";
import auditLogReducer from "../store/auditLogSlice";
import healthReducer from "../store/healthSlice";
import themeReducer from "../store/themeSlice";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import persistStore from "redux-persist/es/persistStore";

const userPersistConfig = {
  key: 'auth',
  version: 1,
  storage,
}

const themePersistConfig = {
  key: 'theme',
  version: 1,
  storage,
}


const persistedAuthReducer = persistReducer(userPersistConfig, authReducer);
const persistedThemeReducer = persistReducer(themePersistConfig, themeReducer);

const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  category: categoryReducer,
  menuItem: menuItemReducer,
  table: tableReducer,
  reservation: reservationReducer,
  order: orderReducer,
  allergen: allergenReducer,
  menuItemAllergen: menuItemAllergenReducer,
  bill: billReducer,
  surplus: surplusReducer,
  kds: kdsReducer,
  auditLog: auditLogReducer,
  health: healthReducer,
  theme: persistedThemeReducer
});

// Configure the store
const store = ConfigureStore({
  reducer:rootReducer,
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      
    },
  }),
});

export const persistor = persistStore(store);

export default store