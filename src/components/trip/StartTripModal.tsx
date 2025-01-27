import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { supabase } from "@/lib/supabase";
import CurrencyInput from "react-currency-input-field";

interface StartTripModalProps {
	isOpen: boolean;
	onClose: () => void;
	truckId: string;
	driverId: string;
	onTripStarted: () => void;
}

const StartTripModal: React.FC<StartTripModalProps> = ({ isOpen, onClose, truckId, driverId, onTripStarted }) => {
	const [origin, setOrigin] = useState("");
	const [companyId, setCompanyId] = useState("");
	const [destination, setDestination] = useState("");
	const [startKm, setStartKm] = useState<number | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				const { data: profile, error } = await supabase
					.from("profiles")
					.select("company_id")
					.eq("id", user.id)
					.single();

				if (error) {
					console.error("Erro ao buscar perfil:", error);
					return;
				}

				setCompanyId(profile.company_id);
			}
		};

		fetchUser();
	}, []);
	const startTrip = async () => {
		setMessage(null);
		setError(null);

		// const startKm = formData.get("amount") as string;
		// const startKmNumber = parseFloat(startKm.replace(/\./g, '').replace(',', '.'));

		const { data, error } = await supabase.from("trip").insert({
			origin,
			destination,
			driver_id: driverId,
			truck_id: truckId,
			company_id: companyId,
			status: "started",
			start_km: startKm,
		}).select("id, origin, destination, truck_id, status, start_km")
			.single();

		if (error) {
			setError("Erro ao iniciar o trajeto.");
			return;
		}

		setMessage("Trajeto iniciado com sucesso!");
		onTripStarted();
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-lg bg-black/80 border-white/10 backdrop-blur-xl text-white">
				<DialogHeader>
					<DialogTitle>Iniciar Trajeto</DialogTitle>
				</DialogHeader>
				<div className="space-y-2">
					{message && <p className="text-green-500">{message}</p>}
					{error && <p className="text-red-500">{error}</p>}
					<Label htmlFor="origin" className="text-gray-300">Origem</Label>
					<Input
						id="origin"
						placeholder="Origem"
						value={origin}
						onChange={(e) => setOrigin(e.target.value)}
						className="bg-white/10 border-white/20 text-white"
					/>
					<Label htmlFor="destination" className="text-gray-300">Destino</Label>
					<Input
						id="destination"
						placeholder="Destino"
						value={destination}
						onChange={(e) => setDestination(e.target.value)}
						className="bg-white/10 border-white/20 text-white mb-2"
					/>
					<Label htmlFor="startKm" className="text-gray-300">KM Inicial</Label>
					{/* <Input
						id="startKm"
						placeholder="KM Inicial"
						type="number"
						value={startKm || ""}
						onChange={(e) => setStartKm(Number(e.target.value))}
						className="bg-white/10 border-white/20 text-white"
					/> */}

					<CurrencyInput
						id="startKm"
						className="flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 bg-white/10 border-white/20 text-white mb-2"
						value={startKm || 0}
						onValueChange={(value) => setStartKm(value ? parseFloat(value) : 0)}
						decimalSeparator=","
						groupSeparator="."
					/>
					<Button onClick={startTrip} className="bg-gradient-to-r from-blue-500 to-purple-600">
						Iniciar Trajeto
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default StartTripModal;