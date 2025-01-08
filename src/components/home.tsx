import React, { useEffect, useState } from "react";
import { TopBar } from "./ui/top-bar";
import { Layout } from "./ui/layout";
import OverviewSection from "./dashboard/OverviewSection";
import VisualizationSection from "./dashboard/VisualizationSection";
import FleetTable from "./dashboard/FleetTable";
import ComparisonTool from "./dashboard/ComparisonTool";
import TruckDetailView from "./dashboard/TruckDetailView";
import { useNavigate } from "react-router-dom";

interface Driver {
	id: string;
	name: string;
	cpf: string;
	phoneNumber: string;
}

interface HomeProps {
	fleetData?: {
		totalFleetCost?: number;
		fuelCosts?: number;
		maintenanceCosts?: number;
		insuranceCosts?: number;
	};
	trucks?: Array<{
		id: string;
		name: string;
		driver?: Driver;
		fuelCost: number;
		maintenanceCost: number;
		insuranceCost: number;
		status: string;
	}>;
}


interface TruckData {
	id: string;
	plate: string;
	driver_name: string;
	combustivel_amount: number;
	manutencao_amount: number;
	pedagio_amount: number;
	outros_amount: number;
	status: string;
}



const Home = ({
}: HomeProps) => {
	const [selectedTruckId, setSelectedTruckId] = React.useState<string | null>(
		null,
	);
	const [isDetailViewOpen, setIsDetailViewOpen] = React.useState(false);

	const handleTruckSelect = (truckId: string) => {
		setSelectedTruckId(truckId);
		setIsDetailViewOpen(true);
	};


	return (
		<Layout>
			<div className="min-h-screen">
				<TopBar />

				<div className="p-6 lg:p-8">
					<div className="max-w-[1400px] mx-auto space-y-6">
						<div className="flex items-center justify-between">

						</div>

						<div className="grid gap-6">
							<OverviewSection />

							<div className="grid lg:grid-cols-2 gap-6">
								<VisualizationSection />
								<ComparisonTool />
							</div>

							<FleetTable
								// trucks={trucks}
								onTruckSelect={handleTruckSelect}
							/>
						</div>

						<TruckDetailView
							open={isDetailViewOpen}
							onOpenChange={setIsDetailViewOpen}
							truckId={selectedTruckId || undefined}
						/>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default Home;
