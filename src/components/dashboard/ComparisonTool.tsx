import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import DatePickerWithRange from "@/components/ui/date-picker-with-range";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Truck {
	id: string;
	name: string;
}

interface ComparisonToolProps {
	onExport?: () => void;
}

const ComparisonTool = ({
	onExport = () => { },
}: ComparisonToolProps) => {
	const [trucks, setTrucks] = useState<Truck[]>([]);
	const [date1, setDate1] = useState<{ from: Date; to: Date }>();
	const [date2, setDate2] = useState<{ from: Date; to: Date }>();
	const [selectedTruck1, setSelectedTruck1] = useState<string>("");
	const [selectedTruck2, setSelectedTruck2] = useState<string>("");
	const [truck1Costs, setTruck1Costs] = useState<any>({});
	const [truck2Costs, setTruck2Costs] = useState<any>({});
	const [period1Costs, setPeriod1Costs] = useState<any>({});
	const [period2Costs, setPeriod2Costs] = useState<any>({});

	const fetchTrucks = async () => {
		try {
			const { data: truckData, error: truckError } = await supabase
				.from("truck")
				.select("id, plate");

			if (truckError) throw truckError;

			const formattedTrucks = truckData.map((truck: any) => ({
				id: truck.id,
				name: truck.plate,
			}));

			setTrucks(formattedTrucks);
			setSelectedTruck1(formattedTrucks[0]?.id || "");
			setSelectedTruck2(formattedTrucks[1]?.id || "");
		} catch (error) {
			console.error("Erro ao buscar caminhões:", error);
		}
	};

	const fetchTruckCosts = async (truckId: string) => {
		try {
			const { data: expenseData, error: expenseError } = await supabase
				.from("expense")
				.select("amount, type")
				.eq("truck_id", truckId);

			if (expenseError) throw expenseError;

			const costs = {
				fuelCost: 0,
				maintenanceCost: 0,
				pedagioCost: 0,
				outrosCost: 0,
			};

			expenseData.forEach((expense) => {
				const amount = expense.amount;
				const type = expense.type;

				if (type === "combustivel") {
					costs.fuelCost += amount;
				} else if (type === "manutencao") {
					costs.maintenanceCost += amount;
				} else if (type === "pedagio") {
					costs.pedagioCost += amount;
				} else if (type === "outros") {
					costs.outrosCost += amount;
				}
			});

			return costs;
		} catch (error) {
			console.error("Erro ao buscar dados:", error);
			return {};
		}
	};

	const fetchPeriodCosts = async (truckId: string, from: Date, to: Date) => {
		try {
			const { data: expenseData, error: expenseError } = await supabase
				.from("expense")
				.select("amount, type")
				.eq("truck_id", truckId)
				.gte("created_at", from.toISOString())
				.lte("created_at", to.toISOString());

			if (expenseError) throw expenseError;

			const costs = {
				fuelCost: 0,
				maintenanceCost: 0,
				pedagioCost: 0,
				outrosCost: 0,
			};

			expenseData.forEach((expense) => {
				const amount = expense.amount;
				const type = expense.type;

				if (type === "combustivel") {
					costs.fuelCost += amount;
				} else if (type === "manutencao") {
					costs.maintenanceCost += amount;
				} else if (type === "pedagio") {
					costs.pedagioCost += amount;
				} else if (type === "outros") {
					costs.outrosCost += amount;
				}
			});

			return costs;
		} catch (error) {
			console.error("Erro ao buscar dados:", error);
			return {};
		}
	};

	useEffect(() => {
		fetchTrucks();
	}, []);

	useEffect(() => {
		const fetchCosts = async () => {
			if (selectedTruck1) {
				const costs1 = await fetchTruckCosts(selectedTruck1);
				setTruck1Costs(costs1);
			}
			if (selectedTruck2) {
				const costs2 = await fetchTruckCosts(selectedTruck2);
				setTruck2Costs(costs2);
			}
		};

		fetchCosts();
	}, [selectedTruck1, selectedTruck2]);

	useEffect(() => {
		const fetchPeriodCostsData = async () => {
			if (selectedTruck1 && date1) {
				const costs1 = await fetchPeriodCosts(selectedTruck1, date1.from, date1.to);
				setPeriod1Costs(costs1);
			}
			if (selectedTruck1 && date2) {
				const costs2 = await fetchPeriodCosts(selectedTruck1, date2.from, date2.to);
				setPeriod2Costs(costs2);
			}
		};

		fetchPeriodCostsData();
	}, [selectedTruck1, date1, date2]);

	return (
		<Card
			glass
			className="p-6 w-full h-[600px] bg-black/40 border-white/5 backdrop-blur-sm"
		>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
						Comparação de custos
					</h2>
					{/* <Button
						variant="outline"
						onClick={onExport}
						className="flex items-center gap-2 border-white/10 text-white hover:bg-white/5"
					>
						<Download className="h-4 w-4" />
						Exportar
					</Button> */}
				</div>

				<Tabs defaultValue="trucks" className="w-full">
					<TabsList className="grid w-full grid-cols-2 max-w-[400px] bg-white/5">
						<TabsTrigger
							value="trucks"
							className="data-[state=active]:bg-white/10"
						>
							Comparar caminhões
						</TabsTrigger>
						<TabsTrigger
							value="time"
							className="data-[state=active]:bg-white/10"
						>
							Comparar período
						</TabsTrigger>
					</TabsList>

					<TabsContent value="trucks" className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-300">
									Selecione a placa 1
								</label>
								<Select
									value={selectedTruck1}
									onValueChange={setSelectedTruck1}
								>
									<SelectTrigger className="bg-white/5 border-white/10 text-white">
										<SelectValue placeholder="Selecione o caminhão" />
									</SelectTrigger>
									<SelectContent className="bg-[#0F1116]/95 border-white/10 backdrop-blur-xl">
										{trucks.map((truck) => (
											<SelectItem key={truck.id} value={truck.id} className="text-white focus:bg-white/10">
												{truck.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-300">
									Selecione a placa 2
								</label>
								<Select
									value={selectedTruck2}
									onValueChange={setSelectedTruck2}
								>
									<SelectTrigger className="bg-white/5 border-white/10 text-white">
										<SelectValue placeholder="Selecione o caminhão" />
									</SelectTrigger>
									<SelectContent className="bg-[#0F1116]/95 border-white/10 backdrop-blur-xl">
										{trucks.map((truck) => (
											<SelectItem key={truck.id} value={truck.id} className="text-white focus:bg-white/10">
												{truck.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="mt-8 grid grid-cols-2 gap-8">
							<Card className="p-4 bg-white/5 border-white/10">
								<h3 className="text-lg font-medium text-white mb-4">
									Custo total de {trucks.find((truck) => truck.id === selectedTruck1)?.name}
								</h3>
								<div className="space-y-2">
									<div className="flex justify-between text-gray-300">
										<span>Combustível</span>
										<span>R$ {truck1Costs.fuelCost?.toLocaleString()}</span>
									</div>
									<div className="flex justify-between text-gray-300">
										<span>Manutenção</span>
										<span>R$ {truck1Costs.maintenanceCost?.toLocaleString()}</span>
									</div>
									<div className="flex justify-between text-gray-300">
										<span>Pedágio</span>
										<span>R$ {truck1Costs.pedagioCost?.toLocaleString()}</span>
									</div>
									<div className="flex justify-between text-gray-300">
										<span>Outros</span>
										<span>R$ {truck1Costs.outrosCost?.toLocaleString()}</span>
									</div>
									<div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-600 mt-4" />
								</div>
							</Card>

							<Card className="p-4 bg-white/5 border-white/10">
								<h3 className="text-lg font-medium text-white mb-4">
									Custo total de {trucks.find((truck) => truck.id === selectedTruck2)?.name}
								</h3>
								<div className="space-y-2">
									<div className="flex justify-between text-gray-300">
										<span>Combustível</span>
										<span>R$ {truck2Costs.fuelCost?.toLocaleString()}</span>
									</div>
									<div className="flex justify-between text-gray-300">
										<span>Manutenção</span>
										<span>R$ {truck2Costs.maintenanceCost?.toLocaleString()}</span>
									</div>
									<div className="flex justify-between text-gray-300">
										<span>Pedágio</span>
										<span>R$ {truck2Costs.pedagioCost?.toLocaleString()}</span>
									</div>
									<div className="flex justify-between text-gray-300">
										<span>Outros</span>
										<span>R$ {truck2Costs.outrosCost?.toLocaleString()}</span>
									</div>
									<div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-600 mt-4" />
								</div>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="time" className="space-y-4">
						<div className="space-y-4">
							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-300">
									Selecione os períodos
								</label>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<DatePickerWithRange defaultPeriod="lastMonth" date={date1} setDate={setDate1} />
									<DatePickerWithRange defaultPeriod="thisMonth" date={date2} setDate={setDate2} />
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-300">
									Selecione o caminhão
								</label>
								<Select
									value={selectedTruck1}
									onValueChange={setSelectedTruck1}
								>
									<SelectTrigger className="bg-white/5 border-white/10 text-white">
										<SelectValue placeholder="Selecione o caminhão" />
									</SelectTrigger>
									<SelectContent className="bg-[#0F1116]/95 border-white/10 backdrop-blur-xl">
										{trucks.map((truck) => (
											<SelectItem key={truck.id} value={truck.id} className="text-white focus:bg-white/10">
												{truck.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="mt-8 grid grid-cols-2 gap-8">
								<Card className="p-4 bg-white/5 border-white/10">
									<h3 className="text-lg font-medium text-white mb-4">
										Custos do Período 1
									</h3>
									<div className="space-y-2">
										<div className="flex justify-between text-gray-300">
											<span>Combustível</span>
											<span>R$ {period1Costs.fuelCost?.toLocaleString()}</span>
										</div>
										<div className="flex justify-between text-gray-300">
											<span>Manutenção</span>
											<span>R$ {period1Costs.maintenanceCost?.toLocaleString()}</span>
										</div>
										<div className="flex justify-between text-gray-300">
											<span>Pedágio</span>
											<span>R$ {period1Costs.pedagioCost?.toLocaleString()}</span>
										</div>
										<div className="flex justify-between text-gray-300">
											<span>Outros</span>
											<span>R$ {period1Costs.outrosCost?.toLocaleString()}</span>
										</div>
										<div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-600 mt-4" />
									</div>
								</Card>

								<Card className="p-4 bg-white/5 border-white/10">
									<h3 className="text-lg font-medium text-white mb-4">
										Custos do Período 2
									</h3>
									<div className="space-y-2">
										<div className="flex justify-between text-gray-300">
											<span>Combustível</span>
											<span>R$ {period2Costs.fuelCost?.toLocaleString()}</span>
										</div>
										<div className="flex justify-between text-gray-300">
											<span>Manutenção</span>
											<span>R$ {period2Costs.maintenanceCost?.toLocaleString()}</span>
										</div>
										<div className="flex justify-between text-gray-300">
											<span>Pedágio</span>
											<span>R$ {period2Costs.pedagioCost?.toLocaleString()}</span>
										</div>
										<div className="flex justify-between text-gray-300">
											<span>Outros</span>
											<span>R$ {period2Costs.outrosCost?.toLocaleString()}</span>
										</div>
										<div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-600 mt-4" />
									</div>
								</Card>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</Card>
	);
};

export default ComparisonTool;