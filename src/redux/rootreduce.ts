import { combineReducers } from '@reduxjs/toolkit';
import uiReducer from '@/store/slices/uiSlice';
import authReducer from '@/Pages/login/services/authSlice';
import userReducer from '@/Pages/login/services/userSlice';

import planReducer from '@/Pages/Plans/services/PlanSlice';
import adminReducer from '@/Pages/admins/admins/services/adminSlice';

const rootReducer = combineReducers({
  ui: uiReducer,
  auth: authReducer,
  user: userReducer,
  plan: planReducer,
  admin: adminReducer,
});

export default rootReducer;
