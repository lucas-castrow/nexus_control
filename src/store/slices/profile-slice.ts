import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Profile {
	id: string;
	email: string;
	full_name: string;
	company_id: string;
	avatar_url: string;
	updated_at: string;
}

interface ProfileState {
	profile: Profile | null;
	isLoading: boolean;
	error: string | null;
}

// Estado inicial
const initialState: ProfileState = {
	profile: null,
	isLoading: false,
	error: null,
};

const profileSlice = createSlice({
	name: "profile",
	initialState,
	reducers: {
		startLoading: (state) => {
			state.isLoading = true;
		},
		setProfile: (state, action: PayloadAction<Profile>) => {
			state.profile = action.payload;
			state.isLoading = false;
			state.error = null;
		},
		updateProfile: (state, action: PayloadAction<Partial<Profile>>) => {
			state.profile = state.profile ? { ...state.profile, ...action.payload } : null;
		},
		clearProfile: (state) => {
			state.profile = null;
		},
		setError: (state, action: PayloadAction<string>) => {
			state.error = action.payload;
			state.isLoading = false;
		},
	},
});

export const { startLoading, setProfile, updateProfile, clearProfile, setError } =
	profileSlice.actions;

export default profileSlice.reducer;
