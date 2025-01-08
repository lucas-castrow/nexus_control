import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Tipos
interface Driver {
	id: string;
	name: string;
	licenseNumber: string;
}

interface DriverState {
	drivers: Driver[];
	isLoading: boolean;
	error: string | null;
}

// Estado inicial
const initialState: DriverState = {
	drivers: [],
	isLoading: false,
	error: null,
};

const driverSlice = createSlice({
	name: "drivers",
	initialState,
	reducers: {
		startLoading: (state) => {
			state.isLoading = true;
		},
		setDrivers: (state, action: PayloadAction<Driver[]>) => {
			state.drivers = action.payload;
			state.isLoading = false;
			state.error = null;
		},
		addDriver: (state, action: PayloadAction<Driver>) => {
			state.drivers.push(action.payload);
		},
		updateDriver: (state, action: PayloadAction<Driver>) => {
			const index = state.drivers.findIndex((driver) => driver.id === action.payload.id);
			if (index !== -1) {
				state.drivers[index] = action.payload;
			}
		},
		deleteDriver: (state, action: PayloadAction<string>) => {
			state.drivers = state.drivers.filter((driver) => driver.id !== action.payload);
		},
		setError: (state, action: PayloadAction<string>) => {
			state.error = action.payload;
			state.isLoading = false;
		},
	},
});

export const { startLoading, setDrivers, addDriver, updateDriver, deleteDriver, setError } =
	driverSlice.actions;

export default driverSlice.reducer;
