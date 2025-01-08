// src/store/hooks.ts

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";

// Hook tipado para dispatch
export const useAppDispatch: () => AppDispatch = useDispatch;

// Hook tipado para selector
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
