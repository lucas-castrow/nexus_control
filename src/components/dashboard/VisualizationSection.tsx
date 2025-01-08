import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

interface CostData {
	truckId: string;
	truckName: string;
	totalCost: number;
	fuelCost: number;
	maintenanceCost: number;
	pedagioCost: number;
	outrosCost: number;
}

interface Props {
	title?: string;
}

const VisualizationSection: React.FC<Props> = ({
	title = "Maiores custos por caminhão",
}) => {
	const [data, setData] = useState<CostData[]>([]);
	const [chartType, setChartType] = useState<"bar" | "pie">("bar");

	const fetchData = async () => {
		try {
			const { data: expenseData, error: expenseError } = await supabase
				.from("expense")
				.select("amount, type, truck_id, truck:truck_id(plate)");

			if (expenseError) throw expenseError;

			const costDataMap: { [key: string]: CostData } = {};

			expenseData.forEach((expense) => {
				const truckId = expense.truck_id;
				const truckName = expense.truck.plate;
				const amount = expense.amount;
				const type = expense.type;

				if (!costDataMap[truckId]) {
					costDataMap[truckId] = {
						truckId,
						truckName,
						totalCost: 0,
						fuelCost: 0,
						maintenanceCost: 0,
						pedagioCost: 0,
						outrosCost: 0,
					};
				}

				costDataMap[truckId].totalCost += amount;

				if (type === "combustivel") {
					costDataMap[truckId].fuelCost += amount;
				} else if (type === "manutencao") {
					costDataMap[truckId].maintenanceCost += amount;
				} else if (type === "pedagio") {
					costDataMap[truckId].pedagioCost += amount;
				} else if (type === "outros") {
					costDataMap[truckId].outrosCost += amount;
				}
			});

			const costData = Object.values(costDataMap);
			const sortedCostData = costData.sort((a, b) => b.totalCost - a.totalCost).slice(0, 3);
			setData(sortedCostData);
		} catch (error) {
			console.error("Erro ao buscar dados:", error);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const maxCost = Math.max(...data.map((item) => item.totalCost));

	return (
		<Card glass className="p-6 w-full h-[400px]">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
					{title}
				</h2>
				{/* <div className="flex gap-2">
                    <Button
                        variant={chartType === "bar" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChartType("bar")}
                    >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Bar
                    </Button>
                    <Button
                        variant={chartType === "pie" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChartType("pie")}
                    >
                        <PieChart className="w-4 h-4 mr-2" />
                        Pie
                    </Button>
                </div> */}
			</div>

			<div className="h-[300px] flex items-center justify-center">
				{chartType === "bar" ? (
					<div className="w-full h-full flex items-end justify-around px-4">
						{data.map((item) => (
							<div
								key={item.truckId}
								className="flex flex-col items-center group relative"
							>
								<div className="absolute bottom-full mb-2 bg-white/10 backdrop-blur-xl border-white/20 rounded-lg p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 w-48 text-white">
									<p className="font-medium">{item.truckName}</p>
									<div className="text-sm">
										{item.totalCost > 0 && <p>Total: R$ {item.totalCost.toLocaleString()}</p>}
										{item.fuelCost > 0 && <p>Combustivel: R$ {item.fuelCost.toLocaleString()}</p>}
										{item.maintenanceCost > 0 && <p>Manutenção: R$ {item.maintenanceCost.toLocaleString()}</p>}
										{item.pedagioCost > 0 && item.pedagioCost !== undefined && <p>Pedágio: R$ {item.pedagioCost.toLocaleString()}</p>}
										{item.outrosCost > 0 && item.outrosCost !== undefined && <p>Outros: R$ {item.outrosCost.toLocaleString()}</p>}
									</div>
								</div>
								<div className="flex flex-col w-24 gap-1">
									<div
										className="w-full bg-blue-500 rounded-t transition-all duration-300 group-hover:bg-blue-600"
										style={{ height: `${(item.totalCost / maxCost) * 200}px` }}
									></div>
									<span className="mt-2 text-sm text-gray-300 font-medium text-center">
										R$ {item.totalCost.toLocaleString()}
									</span>
									<span className="text-xs text-gray-400 text-center">
										{item.truckName}
									</span>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="w-[300px] h-[300px] relative rounded-full border-8 border-blue-500">
						<div className="absolute inset-0 flex items-center justify-center text-gray-500">
							Pie Chart View
						</div>
					</div>
				)}
			</div>
		</Card>
	);
};

export default VisualizationSection;