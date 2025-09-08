import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import carModelReducer from '@/features/carModel/carModelSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    carModel: carModelReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
