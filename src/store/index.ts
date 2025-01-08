import { configureStore } from "@reduxjs/toolkit";
import truckReducer from "./slices/truck-slice";
import driverReducer from "./slices/driver-slice";
import profileReducer from "./slices/profile-slice";

const store = configureStore({
	reducer: {
		trucks: truckReducer,
		drivers: driverReducer,
		profile: profileReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>; // Estado global
export type AppDispatch = typeof store.dispatch;

export default store;
