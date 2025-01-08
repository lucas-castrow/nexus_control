import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Tipos
interface Truck {
	id: string;
	name: string;
	capacity: number;
}

interface TruckState {
	trucks: Truck[];
	isLoading: boolean;
	error: string | null;
}

// Estado inicial
const initialState: TruckState = {
	trucks: [],
	isLoading: false,
	error: null,
};

const truckSlice = createSlice({
	name: "trucks",
	initialState,
	reducers: {
		startLoading: (state) => {
			state.isLoading = true;
		},
		setTrucks: (state, action: PayloadAction<Truck[]>) => {
			state.trucks = action.payload;
			state.isLoading = false;
			state.error = null;
		},
		addTruck: (state, action: PayloadAction<Truck>) => {
			state.trucks.push(action.payload);
		},
		updateTruck: (state, action: PayloadAction<Truck>) => {
			const index = state.trucks.findIndex((truck) => truck.id === action.payload.id);
			if (index !== -1) {
				state.trucks[index] = action.payload;
			}
		},
		deleteTruck: (state, action: PayloadAction<string>) => {
			state.trucks = state.trucks.filter((truck) => truck.id !== action.payload);
		},
		setError: (state, action: PayloadAction<string>) => {
			state.error = action.payload;
			state.isLoading = false;
		},
	},
});

export const { startLoading, setTrucks, addTruck, updateTruck, deleteTruck, setError } =
	truckSlice.actions;

export default truckSlice.reducer;
