import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/ui/layout";
import InputMask from 'react-input-mask';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FileText, Upload, X, User, DollarSign, Clock, ArrowRight, MapPin, Gauge } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { FinalizeTripDialog } from "../truck/FinalizeTripDialog";
import CurrencyInput from "react-currency-input-field";

interface Driver {
	id: string;
	name: string;
	cpf: string;
	phone: string;
}

interface Truck {
	id: string;
	name: string;
	plate: string;
}

const RegisterCostRecord = () => {
	const { company_id } = useParams();
	const [driver, setDriver] = useState<Driver | null>(null);
	const [trucks, setTrucks] = useState<Truck[]>([]);
	const [images, setImages] = useState<File[]>([]);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	interface Trip {
		id?: string;
		origin: string;
		destination: string;
		truck_id: string;
		status: string;
		start_km: number;
		start_time?: string;
		frete?: number;
		comissao?: number;
	}

	const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
	const [trip, setTrip] = useState<Trip | null>(null);
	const [isInTrip, setIsInTrip] = useState<boolean>(false);

	const [origin, setOrigin] = useState("");
	const [destination, setDestination] = useState("");
	const [startKm, setStartKm] = useState<number | "">("");
	const [finalizeWarning, setFinalizeWarning] = useState<string | null>(null);


	const handleFinalizeClick = () => {
		if (trip?.frete === null || trip?.comissao === 0) {
			setFinalizeWarning("Por favor, contate seu superior para completar o registro da viagem antes de finalizar.");
		} else {
			setFinalizeWarning(null);
			setIsFinalizeDialogOpen(true);
		}
	};

	const handleTruckSelection = async (truckId: string) => {
		setSelectedTruck(truckId);
		const { data, error } = await supabase
			.from("trip")
			.select("id, origin, destination, status, start_km, start_time, comissao, frete")
			.eq("truck_id", truckId)
			.eq("status", "started")
			.maybeSingle();

		if (error) {
			setError("Erro ao verificar trajeto.");
			return;
		}
		if (data) {
			setTrip({
				id: data.id,
				origin: data.origin,
				destination: data.destination,
				truck_id: truckId,
				status: data.status,
				start_km: data.start_km,
				start_time: data.start_time,
				frete: data.frete,
				comissao: data.comissao
			});
			setIsInTrip(true);
		} else {
			setTrip(null);
			setIsInTrip(false);
		}
	};

	const startTrip = async () => {
		setMessage(null);
		setError(null);
		const { data, error } = await supabase.from("trip").insert({
			origin,
			destination,
			driver_id: driver?.id,
			truck_id: selectedTruck,
			company_id: company_id,
			status: "started",
			start_km: startKm,
		}).select("id, origin, destination, truck_id, status, start_km")
			.single();

		if (error) {
			setError("Erro ao iniciar o trajeto.");
			return;
		}
		setTrip({
			id: data.id,
			origin,
			destination,
			truck_id: selectedTruck,
			status: "started",
			start_km: Number(startKm),
			frete: null,
			comissao: 0
		});
		setIsInTrip(true);
		setMessage("Trajeto iniciado com sucesso!");
	};

	const handleCPFVerification = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage(null);
		setError(null);
		const formData = new FormData(e.target as HTMLFormElement);
		const cpf = formData.get("cpf") as string;

		const { data: driverData, error: driverError } = await supabase
			.from("driver")
			.select("id, name, cpf, phone")
			.eq("cpf", cpf)
			.eq("company_id", company_id)
			.single();

		if (driverError || !driverData) {
			setError("Motorista não encontrado.");
			setLoading(false);
			return;
		}

		setDriver({
			id: driverData.id,
			name: driverData.name,
			cpf: driverData.cpf,
			phone: driverData.phone,
		});

		const { data: trucksData, error: trucksError } = await supabase
			.from("truck")
			.select("id, name, plate")
			.eq("current_driver_id", driverData.id);

		if (trucksError) {
			setError("Erro ao buscar caminhões.");
			setLoading(false);
			return;
		}

		setTrucks(trucksData);
		setLoading(false);
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setImages((prev) => [...prev, ...Array.from(e.target.files || [])]);
		}
	};

	const removeImage = (index: number) => {
		setImages((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setMessage(null);
		setError(null);
		const formData = new FormData(e.target as HTMLFormElement);
		const type = formData.get("type") as string;
		const description = formData.get("description") as string;
		const amount = parseFloat(formData.get("amount") as string);
		const truckId = selectedTruck as string;

		const { data: expenseData, error: expenseError } = await supabase.from("expense").insert({
			type: type,
			description: description,
			amount: amount,
			truck_id: truckId,
			company_id: company_id,
			driver_id: driver?.id,
			trip_id: trip.id
		}).select("id").single()


		if (expenseError) {
			setError("Erro ao registrar despesa.");
			return;
		}
		const expenseId = expenseData.id;

		for (const image of images) {
			const { data: uploadData, error: uploadError } = await supabase.storage
				.from("expense-images")
				.upload(`${expenseId}/${image.name}`, image);

			if (uploadError) {
				setError("Erro ao fazer upload da imagem.");
				return;
			}

			const imageUrl = supabase.storage
				.from("expense-images")
				.getPublicUrl(uploadData.path).data.publicUrl;

			const { error: imageError } = await supabase.from("expense_image").insert({
				url: imageUrl,
				expense_id: expenseId,
				company_id: company_id,
			});

			if (imageError) {
				setError("Erro ao salvar URL da imagem.");
				return;
			}
		}

		setMessage("Despesa registrada com sucesso!");
		setDriver(null);
		setTrucks([]);
		setImages([]);
		(e.target as HTMLFormElement).reset();
	};

	const [isFinalizeDialogOpen, setIsFinalizeDialogOpen] = useState(false);

	const finalizeTrip = async (endKm: number) => {
		setMessage(null);
		setError(null);
		if (!trip) return;
		const { error } = await supabase
			.from("trip")
			.update({ status: "finished", end_km: endKm, end_time: new Date().toISOString() })
			.eq("id", trip.id);

		if (error) {
			setError("Erro ao finalizar o trajeto.");
			return;
		}
		setIsInTrip(false);
		setTrip(null);
		setMessage("Trajeto finalizado com sucesso!");
		setIsFinalizeDialogOpen(false);
	};


	return (
		<Layout>
			<div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
						Registrar Despesa
					</h1>

					{message && <div className="mb-4 text-green-500">{message}</div>}
					{error && <div className="mb-4 text-red-500">{error}</div>}

					{!driver ? (
						<Card className="p-6 bg-black/40 border-white/10 backdrop-blur-xl">
							<form onSubmit={handleCPFVerification} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="cpf" className="text-gray-300">
										<div className="flex items-center gap-2">
											<User className="w-4 h-4 text-gray-400" />
											CPF do Motorista
										</div>
									</Label>
									<InputMask
										id="cpf"
										name="cpf"
										placeholder="000.000.000-00"
										required
										mask="999.999.999-99"
										className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
									>
										{(inputProps) => <Input {...inputProps} />}
									</InputMask>

								</div>

								<Button
									type="submit"
									className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
									disabled={loading}
								>
									{loading ? "Verificando..." : "Verificar Motorista"}
								</Button>
							</form>
						</Card>
					) : (
						<Card className="p-6 bg-black/40 border-white/10 backdrop-blur-xl">
							<div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
								<h3 className="text-lg font-medium text-white mb-2">
									Informações do Motorista
								</h3>
								<div className="space-y-1">
									<p className="text-gray-300">{driver.name}</p>
									<p className="text-sm text-gray-400">CPF: {driver.cpf}</p>
									<p className="text-sm text-gray-400">
										Telefone: {driver.phone}
									</p>
								</div>
							</div>

							{trucks.length === 0 ? (
								<div className="mt-4 mb-4 p-4 border border-red-500 bg-red-900/20 rounded-lg">
									<p className="text-red-300">
										Você não está associado a nenhum caminhão no momento. Por favor, contate seu superior. Recarregue a página para verificar novamente
									</p>
								</div>
							) : (

								<div className="grid gap-2">
									<Label htmlFor="truck_id" className="text-gray-300">
										Caminhão
									</Label>
									<Select name="truck_id" required onValueChange={handleTruckSelection}>
										<SelectTrigger className="bg-white/10 border-white/20 text-white">
											<SelectValue placeholder="Selecione o caminhão" />
										</SelectTrigger>
										<SelectContent className="bg-[#0F1116]/95 border-white/10 backdrop-blur-xl">
											{trucks.map((truck) => (
												<SelectItem
													key={truck.id}
													value={truck.id}
													className="text-white"
												>
													{truck.name} - {truck.plate}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}

							{selectedTruck && (
								isInTrip ? (
									<div className="mb-4 bg-gray-800 p-4 rounded-lg text-white mt-6">
										<h2 className="text-lg font-semibold mb-2">Trajeto em andamento</h2>
										<div className="grid grid-cols-2 gap-4">
											<div className="flex items-center mb-2">
												<MapPin className="w-5 h-5 text-green-500 mr-2" />
												<span className="font-bold">Origem:</span>
												<span className="ml-1">{trip?.origin}</span>
											</div>
											<div className="flex items-center mb-2">
												<ArrowRight className="w-5 h-5 text-green-500 mr-2" />
												<span className="font-bold">Destino:</span>
												<span className="ml-1">{trip?.destination}</span>
											</div>
											<div className="flex items-center mb-2">
												<Gauge className="w-5 h-5 text-green-500 mr-2" />
												<span className="font-bold">KM Inicial:</span>
												<span className="ml-1">{trip?.start_km}</span>
											</div>
											<div className="flex items-center mb-2">
												<Clock className="w-5 h-5 text-green-500 mr-2" />
												<span className="font-bold">Início:</span>
												<span className="ml-1">{dayjs(trip?.start_time).format("DD/MM/YYYY HH:mm")}</span>
											</div>
										</div>
										{/* <Button onClick={handleFinalizeClick} className="mt-4 mb-4">
											Finalizar Trajeto
										</Button> */}
										{finalizeWarning && <p className="text-red-500">{finalizeWarning}</p>}

									</div>
								) : (
									<div className="space-y-2">
										<div className="mt-4 mb-4 p-4 border border-yellow-500 bg-yellow-900/20 rounded-lg">
											<p className="text-yellow-300">
												Inicie um trajeto com o caminhão {trucks.find((truck) => truck.id === selectedTruck)?.name} - {trucks.find((truck) => truck.id === selectedTruck)?.plate} para poder registrar os custos!
											</p>
										</div>
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
											value={startKm}
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
								)
							)}


							{isInTrip ?
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="space-y-4">
										<div className="grid gap-2">
											<Label htmlFor="type" className="text-gray-300">
												Tipo de Despesa
											</Label>
											<Select name="type" required>
												<SelectTrigger className="bg-white/10 border-white/20 text-white">
													<SelectValue placeholder="Selecione o tipo de despesa" />
												</SelectTrigger>
												<SelectContent className="bg-black/90 border-white/10">
													<SelectItem
														value="pedagio"
														className="text-white focus:bg-white/10"
													>
														Pedágio
													</SelectItem>
													<SelectItem
														value="manutencao"
														className="text-white focus:bg-white/10"
													>
														Manutenção
													</SelectItem>
													<SelectItem
														value="combustivel"
														className="text-white focus:bg-white/10"
													>
														Combustível
													</SelectItem>
													<SelectItem
														value="outros"
														className="text-white focus:bg-white/10"
													>
														Outros
													</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className="grid gap-2">
											<Label htmlFor="amount" className="text-gray-300">
												<div className="flex items-center gap-2">
													<DollarSign className="w-4 h-4 text-gray-400" />
													Valor
												</div>
											</Label>
											<Input
												id="amount"
												name="amount"
												type="number"
												step="0.01"
												required
												placeholder="0.00"
												className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
											/>
										</div>

										<div className="grid gap-2">
											<Label htmlFor="description" className="text-gray-300">
												<div className="flex items-center gap-2">
													<FileText className="w-4 h-4 text-gray-400" />
													Descrição
												</div>
											</Label>
											<Input
												id="description"
												name="description"
												required
												placeholder="Digite a descrição da despesa"
												className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
											/>
										</div>


										<div className="space-y-4">
											<Label className="text-gray-300">
												<div className="flex items-center gap-2">
													<Upload className="w-4 h-4 text-gray-400" />
													Fotos do Recibo
												</div>
											</Label>

											<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
												{images.map((image, index) => (
													<div
														key={index}
														className="relative aspect-square rounded-lg overflow-hidden group"
													>
														<img
															src={URL.createObjectURL(image)}
															alt={`Receipt ${index + 1}`}
															className="w-full h-full object-cover"
														/>
														<button
															type="button"
															onClick={() => removeImage(index)}
															className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
														>
															<X className="w-4 h-4" />
														</button>
													</div>
												))}
												<label className="aspect-square rounded-lg border-2 border-dashed border-white/20 hover:border-white/40 transition-colors flex items-center justify-center cursor-pointer bg-white/5 hover:bg-white/10">
													<input
														type="file"
														accept="image/*"
														multiple
														capture="environment"
														onChange={handleImageUpload}
														className="hidden"
													/>
													<Upload className="w-6 h-6 text-gray-400" />
												</label>
											</div>
										</div>
									</div>

									<Button
										type="submit"
										className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
									>
										Registrar Despesa
									</Button>
								</form>

								: null
							}

						</Card>
					)}
				</div>
			</div>
			<FinalizeTripDialog
				open={isFinalizeDialogOpen}
				onOpenChange={setIsFinalizeDialogOpen}
				onFinalize={finalizeTrip}
				startKm={trip?.start_km || 0}
			/>
		</Layout>
	);
};

export default RegisterCostRecord;