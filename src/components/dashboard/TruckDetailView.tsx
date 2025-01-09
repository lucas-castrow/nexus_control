import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import dayjs from "dayjs";
import CurrencyInput from 'react-currency-input-field';
import {
	BarChart,
	Wallet,
	Wrench,
	Calendar,
	Receipt,
	ChevronLeft,
	ChevronRight,
	X,
	Maximize2,
	MapPin,
	ArrowRight,
	Clock,
	User,
	Check,
	Edit,
	DollarSign,
	ArrowUp,
	ArrowDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "../ui/button";
import NewCostModal from "../expense/NewCostModal";

interface CostEntry {
	date: string;
	description: string;
	amount: number;
	driver: {
		name?: any;
		cpf?: any;
		phone?: any;
	};
	receiptUrls: string[];
	category: "combustivel" | "manutencao" | "pedagio" | "comissao" | "outros";
	trip?: Trip;
}


interface CostTrip {
	pedagioCost: number;
	manutencaoCost: number;
	combustivelCost: number;
	comissaoCost: number;
	outrosCost: number;
	totalCost: number;
	driver: {
		name?: any;
		cpf?: any;
		phone?: any;
	};
	origin: any;
	destination?: any;
	driver_id?: any;
	truck_id?: any;
	status?: any;
	start_km?: any;
	start_time?: any;
	end_time?: any;
	frete?: any;
	comissao?: any;
	end_km?: any;
}
interface Trip {
	id?: any;
	origin?: any;
	destination?: any;
	driver_id?: any;
	truck_id?: any;
	status?: any;
	start_km?: any;
	start_time?: any;
	end_time?: any;
	frete?: any;
	comissao?: any;
	end_km?: any;
}
interface TruckDetailViewProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	truckId: string;
}

const TruckDetailView: React.FC<TruckDetailViewProps> = ({
	open = true,
	onOpenChange,
	truckId,
}) => {
	const [truckData, setTruckData] = useState<any>(null);
	const [drivers, setDrivers] = useState<any[]>([]);
	const [selectedDriver, setSelectedDriver] = useState<string>("");
	const [newDriver, setNewDriver] = useState<string>("");
	const [selectedImages, setSelectedImages] = useState<string[] | null>(null);
	const [inTrip, setIsInTrip] = useState<boolean>(false);
	const [trip, setTrip] = useState<Trip | null>(null);
	const [showConfirmEndTrip, setShowConfirmEndTrip] = useState(false);

	const [editFrete, setEditFrete] = useState(false);
	const [inputFrete, setInputFrete] = useState<number>(0);

	const [editComissao, setEditComissao] = useState(false);
	const [inputComissao, setInputComissao] = useState<number>(0);
	const [isNewCostModalOpen, setIsNewCostModalOpen] = useState(false);

	const fetchTruckData = async () => {
		try {
			const { data: truck, error: truckError } = await supabase
				.from("truck")
				.select("id, plate, current_driver_id, company_id")
				.eq("id", truckId)
				.single();

			if (truckError) throw truckError;

			const { data: expenses, error: expensesError } = await supabase
				.from("expense")
				.select("id, amount, type, created_at, description, driver:driver_id(name, cpf, phone), trip:trip_id(id, origin, destination, start_time, end_time, start_km, end_km, status, frete, comissao) ")
				.eq("truck_id", truckId)
				.order("created_at", { ascending: false });

			if (expensesError) throw expensesError;

			const expenseIds = expenses.map(expense => String(expense.id));
			const { data: expenseImages, error: expenseImagesError } = await supabase
				.from("expense_image")
				.select("*")
				.in("expense_id", expenseIds);

			if (expenseImagesError) throw expenseImagesError;

			const expenseImagesMap = expenseImages.reduce((acc, image) => {
				if (!acc[image.expense_id]) {
					acc[image.expense_id] = [];
				}
				acc[image.expense_id].push(image.url);
				return acc;
			}, {} as Record<string, string[]>);

			const costBreakdown = {
				combustivel: 0,
				manutencao: 0,
				pedagio: 0,
				outros: 0,
			};

			const costTimeline: CostEntry[] = expenses.map((expense) => {
				costBreakdown[expense.type] += expense.amount;
				const trips = Array.isArray(expense.trip) ? expense.trip[0] : expense.trip;
				return {
					date: expense.created_at,
					trip: trips,
					description: expense.description,
					amount: expense.amount,
					driver: Array.isArray(expense.driver) ? expense.driver[0] : expense.driver,
					receiptUrls: expenseImagesMap[expense.id] || [],
					category: expense.type,
				};
			});

			const groupedExpenses = expenses ? expenses.reduce((acc, expense) => {
				const tripz = Array.isArray(expense.trip) ? expense.trip[0] : expense.trip;
				if (tripz) {
					const tripId = tripz.id;
					if (!tripId) return acc;

					if (!acc[tripId]) {
						acc[tripId] = {
							pedagioCost: 0,
							manutencaoCost: 0,
							combustivelCost: 0,
							outrosCost: 0,
							comissaoCost: 0,
							totalCost: 0,
							origin: tripz.origin,
							destination: tripz.destination,
							start_km: tripz.start_km,
							end_km: tripz.end_km,
							status: tripz.status,
							start_time: tripz.start_time,
							end_time: tripz.end_time,
							driver: Array.isArray(expense.driver) ? expense.driver[0] : expense.driver,
							frete: tripz.frete,
							comissao: tripz.comissao,
						};
					}

					acc[tripId][`${expense.type}Cost`] += expense.amount;
					acc[tripId].totalCost += expense.amount;
				}
				return acc; // Certifique-se de retornar o acumulador aqui
			}, {} as Record<string, CostTrip>) : {}; // Adicione um valor padrão vazio

			const costTrip = groupedExpenses ? Object.values(groupedExpenses).sort((a, b) => {
				return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
			}) : [];

			setTruckData({
				id: truck.id,
				name: truck.plate,
				currentDriverId: truck.current_driver_id,
				costBreakdown,
				costTimeline,
				costTrip,
			});
			setSelectedDriver(truck.current_driver_id);
			setNewDriver(truck.current_driver_id);


			const { data: trip, error: tripError } = await supabase
				.from("trip")
				.select("id, origin, destination, driver_id, truck_id, status, start_km, start_time, frete, comissao")
				.eq("truck_id", truckId)
				.eq("driver_id", truck.current_driver_id)
				.eq("status", "started")
				.maybeSingle();

			if (tripError && tripError.code !== "PGRST116") throw tripError;

			if (trip) {
				setTrip(trip);
				setIsInTrip(true);
			} else {
				setIsInTrip(false);
			}

		} catch (error) {
			console.error("Erro ao buscar dados:", error);
		}
	};

	const fetchDrivers = async () => {
		try {
			const { data: drivers, error: driversError } = await supabase
				.from("driver")
				.select("id, name, cpf, phone");

			if (driversError) throw driversError;

			setDrivers(drivers);
		} catch (error) {
			console.error("Erro ao buscar motoristas:", error);
		}
	};

	const updateDriver = async () => {
		try {
			const { error } = await supabase
				.from("truck")
				.update({ current_driver_id: newDriver })
				.eq("id", truckId);

			if (error) throw error;

			setSelectedDriver(newDriver);
			fetchTruckData();
		} catch (error) {
			console.error("Erro ao atualizar motorista:", error);
		}
	};

	useEffect(() => {
		if (truckId) {
			fetchTruckData();
			fetchDrivers();
		}
	}, [truckId]);

	if (!truckData) {
		return <div>Loading...</div>;
	}

	// Group timeline entries by day
	const groupedTimeline = truckData.costTimeline.reduce(
		(acc, entry) => {
			const date = dayjs(entry.date).format("YYYY-MM-DD");
			if (!acc[date]) {
				acc[date] = [];
			}
			acc[date].push(entry);
			return acc;
		},
		{} as Record<string, CostEntry[]>,
	);

	// Sort entries within each day by time
	Object.keys(groupedTimeline).forEach((date) => {
		groupedTimeline[date].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
	});


	const endTrip = async () => {
		try {
			const { error } = await supabase
				.from("trip")
				.update({ status: "finished" })
				.eq("truck_id", truckId)
				.eq("status", "started");

			if (error) throw error;

			fetchTruckData();
		} catch (error) {
			console.error("Erro ao finalizar trajeto:", error);
		}
	};

	const handleConfirmEndTrip = () => {
		endTrip();
		setShowConfirmEndTrip(false);
	};


	const handleFreteSave = async () => {
		try {
			await supabase
				.from("trip")
				.update({ frete: inputFrete })
				.eq("id", trip?.id);
			setEditFrete(false);
			fetchTruckData();
		} catch (error) {
			console.error("Erro ao atualizar frete:", error);
		}
	};

	const handleComissaoSave = async () => {
		try {
			await supabase
				.from("trip")
				.update({ comissao: inputComissao })
				.eq("id", trip?.id);
			setEditComissao(false);
			fetchTruckData();
		} catch (error) {
			console.error("Erro ao atualizar comissao:", error);
		}
	};

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-4xl bg-black/80 border-white/10 backdrop-blur-xl text-white">
					<DialogHeader>
						<DialogTitle className="text-2xl font-bold">
							{truckData.name} Detalhes
						</DialogTitle>
					</DialogHeader>

					<div className="mt-6">
						<Tabs defaultValue="overview" className="w-full">
							<TabsList className="grid w-full grid-cols-3 bg-white/5">
								<TabsTrigger value="overview">Visão Geral dos Custos</TabsTrigger>
								<TabsTrigger value="timeline">Linha do Tempo dos Custos</TabsTrigger>
								<TabsTrigger value="trips">Custos por trajeto</TabsTrigger>
							</TabsList>

							<TabsContent value="overview">
								<div className="mt-8">
									<Card>
										<CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 rounded-t-lg mb-4 ${inTrip ? "bg-green-500 text-black" : "bg-yellow-500 text-black"}`}>
											<CardTitle className="text-sm font-medium text-black">
												{inTrip ? "O motorista atual está em um trajeto" : "O motorista atual não iniciou nenhum trajeto."}
											</CardTitle>
										</CardHeader>
										<CardContent>

											{inTrip && trip && (
												<div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
													{/* Informações da Viagem */}
													<div className="mb-4">
														<h3 className="text-lg font-bold text-green-500 mb-3">Informações da Viagem</h3>
														<div className="grid grid-cols-2 gap-4">
															<div className="flex items-center">
																<MapPin className="w-5 h-5 text-green-500 mr-2" />
																<span className="font-bold">Origem:</span>
																<span className="ml-2">{trip?.origin}</span>
															</div>
															<div className="flex items-center">
																<ArrowRight className="w-5 h-5 text-green-500 mr-2" />
																<span className="font-bold">Destino:</span>
																<span className="ml-2">{trip?.destination}</span>
															</div>
															<div className="flex items-center">
																<Clock className="w-5 h-5 text-green-500 mr-2" />
																<span className="font-bold">Início:</span>
																<span className="ml-2">{dayjs(trip?.start_time).format("DD/MM/YYYY HH:mm")}</span>
															</div>
															<div className="flex items-center">
																<User className="w-5 h-5 text-green-500 mr-2" />
																<span className="font-bold">Motorista:</span>
																<span className="ml-2">{drivers.find(driver => driver.id === selectedDriver)?.name}</span>
															</div>
														</div>
													</div>

													{/* Detalhes Financeiros */}
													<div>
														<h3 className="text-lg font-bold text-green-500 mb-3">Detalhes Financeiros</h3>
														<div className="grid grid-cols-2 gap-4">
															{/* Frete */}
															<div className="flex items-center mt-3 bg-[#4CAF50] bg-opacity-20 p-2 rounded-md border border-[#4CAF50]">
																<DollarSign className="w-5 h-5 mr-2" />
																<span className="font-bold text-lg text-[#4CAF50]">Frete:</span>
																{editFrete ? (
																	<div className="flex items-center gap-2 pl-2">
																		<CurrencyInput
																			id="input-frete"
																			className="w-32 bg-gray-700 border border-gray-600 rounded p-1 text-white"
																			value={inputFrete}
																			onValueChange={(value) => setInputFrete(value ? parseFloat(value) : 0)}
																			decimalSeparator=","
																			groupSeparator="."
																		/>
																		<Button variant="ghost" size="icon" onClick={handleFreteSave}>
																			<Check className="w-5 h-5 text-[#4CAF50]" /> {/* Verde suave */}
																		</Button>
																		<Button variant="ghost" size="icon" onClick={() => setEditFrete(false)}>
																			<X className="w-5 h-5 text-red-500" />
																		</Button>
																	</div>
																) : (
																	<div className="flex items-center gap-2 pl-2">
																		<span>R$ {trip?.frete}</span>
																		<Button variant="ghost" size="icon" onClick={() => {
																			setInputFrete(trip?.frete || 0);
																			setEditFrete(true);
																		}}>
																			<Edit className="w-5 h-5 text-white" />
																		</Button>
																	</div>
																)}
															</div>

															{/* Comissão */}
															<div className="flex items-center mt-3 bg-[#FF9800] bg-opacity-20 p-2 rounded-md border border-[#FF9800]"> {/* Laranja suave e borda */}
																<DollarSign className="w-5 h-5 text-[#FF9800] mr-2" />
																<span className="font-bold text-lg text-[#FF9800] pl-4">Comissão:</span> {/* Laranja suave */}
																{editComissao ? (
																	<div className="flex items-center gap-2 pl-2">
																		<CurrencyInput
																			id="input-comissao"
																			className="w-20 bg-gray-700 border border-gray-600 rounded p-1 text-white"
																			value={inputComissao}
																			onValueChange={(value) => setInputComissao(value ? parseFloat(value) : 0)}
																			decimalSeparator=","
																			groupSeparator="."
																		/>
																		<Button variant="ghost" size="icon" onClick={handleComissaoSave}>
																			<Check className="w-5 h-5 text-[#FF9800]" /> {/* Laranja suave */}
																		</Button>
																		<Button variant="ghost" size="icon" onClick={() => setEditComissao(false)}>
																			<X className="w-5 h-5 text-red-500" />
																		</Button>
																	</div>
																) : (
																	<div className="flex items-center gap-2 pl-2">
																		<span>R$ {trip?.comissao}</span>
																		<Button variant="ghost" size="icon" onClick={() => {
																			setInputComissao(trip?.comissao || 0);
																			setEditComissao(true);
																		}}>
																			<Edit className="w-5 h-5 text-white" />
																		</Button>
																	</div>
																)}
															</div>
														</div>
														{(trip?.frete === null || trip?.comissao === 0) && (
															<p className="text-red-500 mt-4">
																É necessário completar o registro da viagem com valores de frete e comissão.
															</p>
														)}
													</div>
												</div>
											)}

											{!inTrip && (
												<>
													<div className="text-lg font-bold mb-4">
														Motorista: {drivers.find(driver => driver.id === selectedDriver)?.name || "Nenhum motorista selecionado"}
													</div>
													<Select
														value={newDriver}
														onValueChange={(value) => {
															setNewDriver(value);
														}}
													>
														<SelectTrigger className="bg-white/5 border-white/10 text-white">
															<SelectValue placeholder="Selecione o motorista" />
														</SelectTrigger>
														<SelectContent className="bg-[#0F1116]/95 border-white/10 backdrop-blur-xl">
															{drivers.map((driver) => (
																<SelectItem key={driver.id} value={driver.id} className="text-white focus:bg-white/10">
																	<div>
																		<div>{driver?.name}</div>
																		<div className="text-xs text-gray-400">CPF: {driver?.cpf}</div>
																		<div className="text-xs text-gray-400">Telefone: {driver?.phone}</div>
																	</div>
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													<Button onClick={updateDriver} className="mt-4">
														Atualizar Motorista
													</Button>

												</>
											)}
											{inTrip && (
												<>
													<Button onClick={() => setShowConfirmEndTrip(true)} className="mt-4">
														Finalizar Trajeto
													</Button>

													{showConfirmEndTrip && (
														<Dialog open={showConfirmEndTrip} onOpenChange={setShowConfirmEndTrip}>
															<DialogContent className="bg-black/80 border-white/10 backdrop-blur-xl text-white">
																<DialogHeader>
																	<DialogTitle>Confirmar</DialogTitle>
																</DialogHeader>
																<div className="p-4 text-center">
																	<p className="mb-4">Tem certeza que deseja finalizar o trajeto?</p>
																	<div className="flex justify-center gap-4">
																		<Button onClick={handleConfirmEndTrip}>Sim</Button>
																		<Button variant="outline" onClick={() => setShowConfirmEndTrip(false)}>
																			Não
																		</Button>
																	</div>
																</div>
															</DialogContent>
														</Dialog>
													)}
												</>
											)}
										</CardContent>
									</Card>
								</div>
								<div className="grid grid-cols-2 gap-4 mt-4">
									<Card>
										<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white/5 rounded-t-lg mb-4">
											<CardTitle className="text-sm font-medium">
												Custos de Combustível
											</CardTitle>
											<Wallet className="h-4 w-4 text-muted-foreground" />
										</CardHeader>
										<CardContent>
											<div className="text-2xl font-bold">
												R$ {truckData.costBreakdown.combustivel.toLocaleString()}
											</div>
										</CardContent>
									</Card>

									<Card>
										<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white/5 rounded-t-lg mb-4">
											<CardTitle className="text-sm font-medium">
												Manutenção
											</CardTitle>
											<Wrench className="h-4 w-4 text-muted-foreground" />
										</CardHeader>
										<CardContent>
											<div className="text-2xl font-bold">
												R$ {truckData.costBreakdown.manutencao.toLocaleString()}
											</div>
										</CardContent>
									</Card>

									<Card>
										<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white/5 rounded-t-lg mb-4">
											<CardTitle className="text-sm font-medium">
												Pedágio
											</CardTitle>
											<Calendar className="h-4 w-4 text-muted-foreground" />
										</CardHeader>
										<CardContent>
											<div className="text-2xl font-bold">
												R$ {truckData.costBreakdown.pedagio.toLocaleString()}
											</div>
										</CardContent>
									</Card>

									<Card>
										<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white/5 rounded-t-lg mb-4">
											<CardTitle className="text-sm font-medium">
												Outros Custos
											</CardTitle>
											<BarChart className="h-4 w-4 text-muted-foreground" />
										</CardHeader>
										<CardContent>
											<div className="text-2xl font-bold">
												R$ {truckData.costBreakdown.outros.toLocaleString()}
											</div>
										</CardContent>
									</Card>
								</div>
							</TabsContent>

							<TabsContent value="timeline">
								<Card>
									<div className="flex justify-between items-center mb-4">
										<CardHeader>
											<CardTitle>Linha do Tempo dos Custos</CardTitle>
										</CardHeader>
										<Button onClick={() => setIsNewCostModalOpen(true)} className="bg-blue-500 text-white hover:bg-blue-600 mr-4">
											Novo Custo
										</Button>
									</div>
									<CardContent>
										<ScrollArea className="h-[400px] pr-4">
											<div className="space-y-8">
												{Object.entries(groupedTimeline).map(
													([date, entries]) => (
														<div
															key={date}
															className="pb-8 border-b last:border-0"
														>
															<div className="text-sm font-medium mb-4">
																{dayjs(date).format("DD/MM/YYYY")}
															</div>
															<div className="space-y-6">
																{Array.isArray(entries) && entries.map((entry: CostEntry, entryIndex: number) => (
																	<div key={entryIndex} className="flex items-start gap-4">
																		<div className="flex-grow">
																			<div className="flex items-start justify-between">
																				<div>
																					<h4 className="text-m font-medium">
																						{entry.description}
																					</h4>

																					<span className="text-sm font-small text-gray-500">
																						Hora: {dayjs(entry.date).format("HH:mm")}
																					</span>
																					{entry.driver ?
																						<div className="text-xs text-gray-500">
																							Motorista: {entry.driver?.name}
																							<span className="ml-2">
																								CPF: {entry.driver?.cpf}
																							</span>
																						</div>
																						: <div></div>}

																					{entry.trip ?
																						<div className="flex items-center mb-2 mt-2">
																							<MapPin className="w-4 h-4 text-green-500 mr-2" />
																							<span className="text-xs text-gray-500 font-small">Origem:</span>
																							<span className="text-xs text-gray-500 ml-2 font-small">{entry.trip?.origin}</span>
																						</div>
																						: null}

																					{entry.trip ?
																						<div className="flex items-center mb-2">
																							<ArrowRight className="w-4 h-4 text-green-500 mr-2" />
																							<span className="text-xs text-gray-500 font-small">Destino:</span>
																							<span className="text-xs text-gray-500 ml-2 font-small">{entry.trip?.destination}</span>
																						</div>
																						: null}

																					<span className="text-lg font-semibold">
																						R$ {entry.amount.toLocaleString()}
																					</span>
																					<div className="flex items-center gap-2 mt-1">
																						<Receipt className="w-4 h-4 text-gray-400" />
																						<span className="text-sm text-gray-500 capitalize">
																							{entry.category}
																						</span>
																					</div>
																				</div>
																				<div className="flex gap-2">
																					{entry.receiptUrls.map((url, imgIndex) => (
																						<div
																							key={imgIndex}
																							className="relative group cursor-pointer"
																							onClick={() => setSelectedImages(entry.receiptUrls)}
																						>
																							<img
																								src={url}
																								alt={`Receipt ${imgIndex + 1}`}
																								className="w-16 h-16 object-cover rounded-lg shadow-sm"
																							/>
																							<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex items-center justify-center">
																								<Maximize2 className="w-4 h-4 text-white" />
																							</div>
																						</div>
																					))}
																				</div>
																			</div>
																		</div>
																	</div>
																))}
															</div>
														</div>
													),
												)}
											</div>
										</ScrollArea>
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="trips">
								<Card>
									<CardHeader>
										<CardTitle>Custos cadastrados por trajeto</CardTitle>
									</CardHeader>
									<CardContent>
										<ScrollArea className="h-[400px] pr-4">
											{truckData.costTrip.map((tripCost, index) => (
												<div key={index} className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
													{/* Título com Origem e Destino */}
													<div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
														<h3 className="text-green-500 font-bold text-lg">
															{tripCost.origin} → {tripCost.destination}
														</h3>
														<span className="text-gray-400 text-sm">
															Início: {dayjs(tripCost.start_time).format("DD/MM/YYYY HH:mm")} | Fim:{" "}
															{tripCost.end_time ? dayjs(tripCost.end_time).format("DD/MM/YYYY HH:mm") : "Em andamento"}
														</span>
													</div>

													{/* Informações principais e custos em grid */}
													<div className="grid grid-cols-2 gap-6">
														{/* Informações principais */}
														<div>
															<div className="flex items-center mb-3">
																<User className="w-5 h-5 text-green-500 mr-2" />
																<span className="font-bold">Motorista:</span>
																<span className="ml-2">{tripCost.driver?.name}</span>
															</div>
															<div className="flex items-center mb-3">
																<span className="font-bold">KM Início:</span>
																<span className="ml-2">{tripCost.start_km}</span>
															</div>
															{tripCost.end_km && (
																<div className="flex items-center">
																	<span className="font-bold">KM Término:</span>
																	<span className="ml-2">{tripCost.end_km}</span>
																</div>
															)}

															<div className="flex items-center mt-3 bg-green-700 p-2 rounded-lg shadow-sm">
																<div className="flex items-center">
																	<ArrowUp className="w-5 h-5 text-green-200 mr-2" />
																	<span className="font-bold text-white">Frete:</span>
																</div>
																<span className="ml-2 font-semibold text-white">
																	R$ {tripCost.frete}
																</span>
															</div>
														</div>

														{/* Custos */}
														<div>
															<h4 className="text-green-500 font-bold text-lg mb-2">Custos</h4>

															{/* Pedágio */}
															<div className="flex justify-between mb-2">
																<div className="flex items-center">
																	<ArrowDown className="w-5 h-5 text-red-500 mr-2" />
																	<span>Pedágio:</span>
																</div>
																<span>R$ {tripCost.pedagioCost.toFixed(2)}</span>
															</div>

															{/* Combustível */}
															<div className="flex justify-between mb-2">
																<div className="flex items-center">
																	<ArrowDown className="w-5 h-5 text-red-500 mr-2" />
																	<span>Combustível:</span>
																</div>
																<span>R$ {tripCost.combustivelCost.toFixed(2)}</span>
															</div>

															{/* Manutenção */}
															<div className="flex justify-between mb-2">
																<div className="flex items-center">
																	<ArrowDown className="w-5 h-5 text-red-500 mr-2" />
																	<span>Manutenção:</span>
																</div>
																<span>R$ {tripCost.manutencaoCost.toFixed(2)}</span>
															</div>

															{/* Comissão */}
															<div className="flex justify-between mb-2">
																<div className="flex items-center">
																	<ArrowDown className="w-5 h-5 text-red-500 mr-2" />
																	<span>Comissão:</span>
																</div>
																<span>R$ {tripCost.comissaoCost.toFixed(2)}</span>
															</div>

															{/* Outros Custos */}
															<div className="flex justify-between mb-2">
																<div className="flex items-center">
																	<ArrowDown className="w-5 h-5 text-red-500 mr-2" />
																	<span>Outros:</span>
																</div>
																<span>R$ {tripCost.outrosCost.toFixed(2)}</span>
															</div>

															{/* Exibição do total de custos */}
															<div className="flex justify-between mt-4 border-t border-gray-700 pt-2">
																<div className="flex items-center">
																	<span className="font-bold">Total Custos:</span>
																</div>
																<span className="font-bold text-red-400">- R$ {tripCost.totalCost.toFixed(2)}</span>
															</div>

															{/* Exibição do Lucro */}
															<div className="flex justify-between mt-4 border-t border-gray-700 pt-2">
																<div className="flex items-center">
																	{tripCost.frete - tripCost.totalCost >= 0 ? (
																		<DollarSign className="w-5 h-5 text-green-500 mr-2" />
																	) : (
																		<DollarSign className="w-5 h-5 text-red-500 mr-2" />
																	)}
																	<span className="font-bold text-lg">Lucro Total:</span>
																</div>
																<span
																	className={`font-bold text-lg ${tripCost.frete - tripCost.totalCost >= 0 ? 'text-green-500' : 'text-red-500'}`}
																>
																	{tripCost.frete - tripCost.totalCost >= 0 ? (
																		`R$ ${(tripCost.frete - tripCost.totalCost).toFixed(2)}`
																	) : (
																		<span>
																			- R$ {Math.abs(tripCost.frete - tripCost.totalCost).toFixed(2)}
																		</span>
																	)}
																</span>
															</div>
														</div>
													</div>
												</div>
											))}


										</ScrollArea>
									</CardContent>
								</Card>
							</TabsContent>
						</Tabs>
					</div>
				</DialogContent>
			</Dialog>

			{selectedImages && (
				<ImageViewer
					urls={selectedImages}
					onClose={() => setSelectedImages(null)}
				/>
			)}
			<NewCostModal company_id={truckData.company_id} truckId={truckId} isOpen={isNewCostModalOpen} onClose={() => setIsNewCostModalOpen(false)} />
		</>
	);
};

const ImageViewer = ({
	urls,
	onClose,
}: {
	urls: string[];
	onClose: () => void;
}) => {
	const [currentIndex, setCurrentIndex] = useState(0);

	const nextImage = () => {
		setCurrentIndex((prev) => (prev + 1) % urls.length);
	};

	const prevImage = () => {
		setCurrentIndex((prev) => (prev - 1 + urls.length) % urls.length);
	};

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl bg-black/90 border-white/10 backdrop-blur-xl">
				<div className="relative">
					<Button
						variant="ghost"
						size="icon"
						className="absolute right-0 top-0 text-white"
						onClick={onClose}
					>
						<X className="h-6 w-6" />
					</Button>
					<div className="flex items-center justify-center gap-4 p-4">
						<Button
							variant="ghost"
							size="icon"
							className="text-white"
							onClick={prevImage}
							disabled={urls.length <= 1}
						>
							<ChevronLeft className="h-8 w-8" />
						</Button>
						<div className="relative h-[500px] w-[500px]">
							<img
								src={urls[currentIndex]}
								alt="Receipt"
								className="h-full w-full object-contain"
							/>
						</div>
						<Button
							variant="ghost"
							size="icon"
							className="text-white"
							onClick={nextImage}
							disabled={urls.length <= 1}
						>
							<ChevronRight className="h-8 w-8" />
						</Button>
					</div>
					{urls.length > 1 && (
						<div className="text-center text-white text-sm">
							{currentIndex + 1} / {urls.length}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default TruckDetailView;