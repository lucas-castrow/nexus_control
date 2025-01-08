import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Truck, Fuel, Wrench, Shield, DollarSign, Handshake, Coins, Minus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DateRange, DayPicker, getDefaultClassNames } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import DatePickerWithRange from "../ui/date-picker-with-range";
// import "react-day-picker/dist/style.css";

interface OverviewSectionProps { }

const OverviewSection = ({ }: OverviewSectionProps) => {
	const [totalFleetCost, setTotalFleetCost] = useState<number>(0);
	const [fuelCosts, setFuelCosts] = useState<number>(0);
	const [maintenanceCosts, setMaintenanceCosts] = useState<number>(0);
	const [pedagioCosts, setPedagioCosts] = useState<number>(0);
	const [outrosCosts, setOutrosCosts] = useState<number>(0);
	const [totalIncome, setTotalIncome] = useState<number>(0);
	const [comissaoCosts, setComissaoCosts] = useState<number>(0);
	const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>();

	const fetchData = async () => {
		try {
			let query = supabase.from("expense").select("amount, type, created_at");

			if (dateRange?.from && dateRange?.to) {
				query = query.gte("created_at", dateRange.from.toISOString()).lte("created_at", dateRange.to.toISOString());
			}

			const { data: expensesData, error: expensesError } = await query;
			if (expensesError) throw expensesError;

			const totalFleetCost = expensesData.reduce((acc, curr) => acc + curr.amount, 0);
			setTotalFleetCost(totalFleetCost);

			const fuelCosts = expensesData
				.filter((expense) => expense.type === "combustivel")
				.reduce((acc, curr) => acc + curr.amount, 0);
			setFuelCosts(fuelCosts);

			const maintenanceCosts = expensesData
				.filter((expense) => expense.type === "manutencao")
				.reduce((acc, curr) => acc + curr.amount, 0);
			setMaintenanceCosts(maintenanceCosts);

			const pedagioCosts = expensesData
				.filter((expense) => expense.type === "pedagio")
				.reduce((acc, curr) => acc + curr.amount, 0);
			setPedagioCosts(pedagioCosts);

			const comissaoCosts = expensesData
				.filter((expense) => expense.type === "comissao")
				.reduce((acc, curr) => acc + curr.amount, 0);
			setComissaoCosts(comissaoCosts);

			const outrosCosts = expensesData
				.filter((expense) => expense.type === "outros")
				.reduce((acc, curr) => acc + curr.amount, 0);
			setOutrosCosts(outrosCosts);

			// Consulta de ganhos
			let incomeQuery = supabase.from("income").select("amount, created_at");
			if (dateRange?.from && dateRange?.to) {
				incomeQuery = incomeQuery.gte("created_at", dateRange.from.toISOString()).lte("created_at", dateRange.to.toISOString());
			}

			const { data: incomesData, error: incomesError } = await incomeQuery;
			if (incomesError) throw incomesError;

			const totalIncome = incomesData.reduce((acc, curr) => acc + curr.amount, 0);
			setTotalIncome(totalIncome);
		} catch (error) {
			console.error("Erro ao buscar dados:", error);
		}
	};

	useEffect(() => {
		fetchData();
	}, [dateRange]);

	const totalProfit = totalIncome - totalFleetCost;

	return (
		<div className="w-full space-y-4">
			<div className="flex items-center justify-between relative">
				<h2 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
					Geral
				</h2>
				<div className="relative">
					<DatePickerWithRange defaultPeriod="thisMonth" date={dateRange} setDate={setDateRange} />
				</div>
			</div>


			<div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
				{/* Coluna de Custos */}
				<div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<h3 className="text-lg font-semibold text-gray-300 col-span-full">Custos</h3>
					{/* Custo total */}
					<Card glass className="relative overflow-hidden transition-all hover:shadow-lg group">
						<div className="p-4">
							<div className="flex items-center gap-2">
								<div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl">
									<Truck className="w-5 h-5 text-blue-400" />
								</div>
								<div className="space-y-1">
									<p className="text-xs font-medium text-gray-300">Custo total</p>
									<div className="flex items-center gap-1">
										<p className="text-xl font-bold text-white">
											R$ {totalFleetCost.toLocaleString()}
										</p>
									</div>
								</div>
							</div>
						</div>
						<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300" />
					</Card>

					{/* Combustível */}
					<Card glass className="relative overflow-hidden transition-all hover:shadow-lg group">
						<div className="p-4">
							<div className="flex items-center gap-2">
								<div className="p-2 bg-gradient-to-br from-green-500/20 to-blue-600/20 rounded-xl">
									<Fuel className="w-5 h-5 text-green-400" />
								</div>
								<div className="space-y-1">
									<p className="text-xs font-medium text-gray-300">Combustível</p>
									<div className="flex items-center gap-1">
										<p className="text-xl font-bold text-white">
											R$ {fuelCosts.toLocaleString()}
										</p>
									</div>
								</div>
							</div>
						</div>
						<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-600 group-hover:from-green-600 group-hover:to-blue-700 transition-all duration-300" />
					</Card>

					{/* Manutenção */}
					<Card glass className="relative overflow-hidden transition-all hover:shadow-lg group">
						<div className="p-4">
							<div className="flex items-center gap-2">
								<div className="p-2 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-xl">
									<Wrench className="w-5 h-5 text-orange-400" />
								</div>
								<div className="space-y-1">
									<p className="text-xs font-medium text-gray-300">Manutenção</p>
									<div className="flex items-center gap-1">
										<p className="text-xl font-bold text-white">
											R$ {maintenanceCosts.toLocaleString()}
										</p>
									</div>
								</div>
							</div>
						</div>
						<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-600 group-hover:from-orange-600 group-hover:to-red-700 transition-all duration-300" />
					</Card>

					{/* Pedágio */}
					<Card glass className="relative overflow-hidden transition-all hover:shadow-lg group">
						<div className="p-4">
							<div className="flex items-center gap-2">
								<div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-xl">
									<Coins className="w-5 h-5 text-purple-400" />
								</div>
								<div className="space-y-1">
									<p className="text-xs font-medium text-gray-300">Pedágio</p>
									<div className="flex items-center gap-1">
										<p className="text-xl font-bold text-white">
											R$ {pedagioCosts.toLocaleString()}
										</p>
									</div>
								</div>
							</div>
						</div>
						<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-600 group-hover:from-purple-600 group-hover:to-pink-700 transition-all duration-300" />
					</Card>



					{/* Comissao */}
					<Card glass className="relative overflow-hidden transition-all hover:shadow-lg group">
						<div className="p-4">
							<div className="flex items-center gap-2">
								<div className="p-2 bg-gradient-to-br from-red-500/20 to-pink-600/20 rounded-xl">
									<Handshake className="w-5 h-5 text-purple-400" />
								</div>
								<div className="space-y-1">
									<p className="text-xs font-medium text-gray-300">Comissão</p>
									<div className="flex items-center gap-1">
										<p className="text-xl font-bold text-white">
											R$ {comissaoCosts.toLocaleString()}
										</p>
									</div>
								</div>
							</div>
						</div>
						<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-pink-600 group-hover:from-red-600 group-hover:to-pink-700 transition-all duration-300" />
					</Card>
					{/* Outros */}
					<Card glass className="relative overflow-hidden transition-all hover:shadow-lg group">
						<div className="p-4">
							<div className="flex items-center gap-2">
								<div className="p-2 bg-gradient-to-br from-green-500/20 to-yellow-600/20 rounded-xl">
									<Minus className="w-5 h-5 text-green-400" />
								</div>
								<div className="space-y-1">
									<p className="text-xs font-medium text-gray-300">Outros</p>
									<div className="flex items-center gap-1">
										<p className="text-xl font-bold text-white">
											R$ {outrosCosts.toLocaleString()}
										</p>
									</div>
								</div>
							</div>
						</div>
						<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-yellow-600 group-hover:from-green-600 group-hover:to-yellow-700 transition-all duration-300" />
					</Card>
				</div>

				{/* Coluna de Ganhos */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-gray-300">Receita</h3>
					{/* Ganhos Totais */}
					<Card glass className="relative overflow-hidden transition-all hover:shadow-lg group">
						<div className="p-6">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-xl">
									<DollarSign className="w-6 h-6 text-green-400" />
								</div>
								<div className="space-y-1">
									<p className="text-sm font-medium text-gray-300">Recebidos</p>
									<div className="flex items-center gap-2">
										<p className="text-2xl font-bold text-white">
											R$ {totalIncome.toLocaleString()}
										</p>
									</div>
								</div>
							</div>
						</div>
						<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-600 group-hover:from-green-500 group-hover:to-emerald-700 transition-all duration-300" />
					</Card>

					{/* Lucro */}
					<Card glass className="relative overflow-hidden transition-all hover:shadow-lg group">
						<div className="p-6">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-gradient-to-br from-yellow-400/20 to-orange-600/20 rounded-xl">
									<DollarSign className="w-6 h-6 text-yellow-400" />
								</div>
								<div className="space-y-1">
									<p className="text-sm font-medium text-gray-300">Lucro</p>
									<div className="flex items-center gap-2">
										<p className="text-2xl font-bold text-white">
											R$ {totalProfit.toLocaleString()}
										</p>
									</div>
								</div>
							</div>
						</div>
						<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-600 group-hover:from-yellow-500 group-hover:to-orange-700 transition-all duration-300" />
					</Card>
				</div>
			</div>
		</div>
	);
};

export default OverviewSection;