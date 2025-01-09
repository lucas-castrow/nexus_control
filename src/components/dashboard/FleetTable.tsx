import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AddTruckDialog } from "./AddTruckDialog";
import { ManageDriverDialog } from "./ManageDriverDialog";
import { Search, Plus, UserPlus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAppSelector } from "@/store/hooks";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "../ui/dialog";
import { DeleteTruckDialog } from "../truck/DeleteTruckDialog";
import { ViewDriversDialog } from "../driver/ViewDriversDialog";

interface Driver {
	id: string;
	name: string;
	cpf?: string;
	phone?: string;
}

interface TruckData {
	id: string;
	name: string;
	plate: string;
	driver_name: string;
	combustivel_amount: number;
	manutencao_amount: number;
	pedagio_amount: number;
	outros_amount: number;
	status: string;
}

interface FleetTableProps {
	onTruckSelect?: (truckId: string) => void;
}
const FleetTable = ({
	onTruckSelect = () => { },
}: FleetTableProps) => {
	const profile = useAppSelector((state) => state.profile.profile);
	const [trucks, setTrucks] = useState<TruckData[] | null>(null);
	const [drivers, setDrivers] = useState<Driver[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [driverFilter, setDriverFilter] = useState("all");
	const [isAddTruckOpen, setIsAddTruckOpen] = useState(false);
	const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [driverPage, setDriverPage] = useState(1);
	const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
	const [truckToRemove, setTruckToRemove] = useState<TruckData | null>(null);
	const [isViewDriversOpen, setIsViewDriversOpen] = useState(false);

	const trucksPerPage = 10;
	const driversPerPage = 5;

	const fetchTruckData = async () => {
		try {
			let query = supabase
				.from("truck")
				.select(
					`
                    id,
                    name,
                    plate,
                    driver:current_driver_id(id, name),
                    expense(type, amount),
                    status
                    `
				);

			if (statusFilter !== "all") {
				query = query.eq("status", statusFilter);
			}

			if (searchTerm) {
				query = query.ilike("plate", `%${searchTerm}%`);
			}

			if (driverFilter !== "all") {
				query = query.eq("current_driver_id", driverFilter);
			}

			const start = (currentPage - 1) * trucksPerPage;
			const end = start + trucksPerPage;

			query = query.range(start, end + 1);
			const { data, error } = await query;

			if (error) throw error;

			const formattedData: TruckData[] = data.map((truck) => {
				const expenses = truck.expense || [];
				const drivers = truck.driver || { id: '', name: '' };
				const combustivel_amount = expenses
					.filter((e) => e.type === "combustivel")
					.reduce((acc, curr) => acc + curr.amount, 0);

				const manutencao_amount = expenses
					.filter((e) => e.type === "manutencao")
					.reduce((acc, curr) => acc + curr.amount, 0);

				const pedagio_amount = expenses
					.filter((e) => e.type === "pedagio")
					.reduce((acc, curr) => acc + curr.amount, 0);
				const outros_amount = expenses
					.filter((e) => e.type === "outros")
					.reduce((acc, curr) => acc + curr.amount, 0);

				return {
					id: truck.id,
					name: truck.name,
					plate: truck.plate,
					driver_name: Array.isArray(drivers) ? '' : drivers.name,
					combustivel_amount,
					manutencao_amount,
					pedagio_amount,
					outros_amount,
					status: truck.status,
				};
			});

			setTrucks(formattedData);
		} catch (error) {
			console.error("Erro ao buscar dados dos caminhões:", error);
			setTrucks(null);
		}
	};

	const fetchDriverData = async () => {
		try {
			const { data, error } = await supabase
				.from("driver")
				.select("id, name")
				.range((driverPage - 1) * driversPerPage, driverPage * driversPerPage - 1);

			if (error) throw error;

			setDrivers(data);
		} catch (error) {
			console.error("Erro ao buscar dados dos motoristas:", error);
		}
	};

	useEffect(() => {
		if (profile) {
			fetchTruckData();
		}
	}, [profile, statusFilter, driverFilter]);

	useEffect(() => {
		fetchDriverData();
	}, [driverPage]);

	const handleTruckClick = (truck: TruckData) => {
		onTruckSelect(truck.id);
	};

	const handleRemoveClick = (truck: TruckData) => {
		setTruckToRemove(truck);
		setIsRemoveModalOpen(true);
	};

	const handleConfirmRemove = async () => {
		if (truckToRemove) {
			try {
				const { error } = await supabase
					.from("truck")
					.delete()
					.eq("id", truckToRemove.id);

				if (error) throw error;

				setTrucks((prevTrucks) => prevTrucks?.filter((truck) => truck.id !== truckToRemove.id) || null);
				setIsRemoveModalOpen(false);
				setTruckToRemove(null);
			} catch (error) {
				console.error("Erro ao remover caminhão:", error);
			}
		}
	};

	const indexOfLastTruck = currentPage * trucksPerPage;
	const indexOfFirstTruck = indexOfLastTruck - trucksPerPage;
	const currentTrucks = trucks?.slice(indexOfFirstTruck, indexOfLastTruck);

	const totalPages = Math.ceil((trucks?.length || 0) / trucksPerPage);

	const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			fetchTruckData();
		}
	};


	return (
		<Card glass className="w-full p-4 md:p-6">
			<div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
				<div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
					{/* Search */}
					<div className="relative w-full md:max-w-sm">
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
						<Input
							placeholder="Buscar por placa"
							value={searchTerm}
							onKeyDown={handleSearchKeyDown}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20"
						/>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-2 w-full md:w-auto">
						<Button
							onClick={() => setIsAddTruckOpen(true)}
							className="flex-1 md:flex-none bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center gap-2"
						>
							<Plus className="h-4 w-4" />
							Adicionar Caminhão
						</Button>
						<Button
							variant="outline"
							onClick={() => setIsAddDriverOpen(true)}
							className="flex-1 md:flex-none border-white/20 text-white hover:bg-white/10 flex items-center gap-2"
						>
							<UserPlus className="h-4 w-4" />
							Adicionar motorista
						</Button>

						<Button
							variant="outline"
							onClick={() => setIsViewDriversOpen(true)}
							className="flex-1 md:flex-none border-white/20 text-white hover:bg-white/10 flex items-center gap-2"
						>
							Ver motoristas
						</Button>
					</div>

					{/* Filters */}
					<div className="flex flex-col md:flex-row gap-4 w-full md:w-auto ml-auto">
						<div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
							<div>
								<span className="text-white mb-1 block">Status</span>
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="w-full sm:w-[180px] bg-white/10 border-white/20 text-white">
										<SelectValue placeholder="Status Filter" />
									</SelectTrigger>
									<SelectContent className="bg-[#0F1116]/95 border-white/10 backdrop-blur-xl">
										<SelectItem
											value="all"
											className="text-white focus:bg-white/10"
										>
											Todos
										</SelectItem>
										<SelectItem
											value="active"
											className="text-white focus:bg-white/10"
										>
											Ativo
										</SelectItem>
										<SelectItem
											value="maintenance"
											className="text-white focus:bg-white/10"
										>
											Em manutenção
										</SelectItem>
										<SelectItem
											value="inactive"
											className="text-white focus:bg-white/10"
										>
											Inativo
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<span className="text-white mb-1 block">Motorista</span>
								<Select value={driverFilter} onValueChange={setDriverFilter}>
									<SelectTrigger className="w-full sm:w-[180px] bg-white/10 border-white/20 text-white">
										<SelectValue placeholder="Driver Filter" />
									</SelectTrigger>
									<SelectContent className="bg-[#0F1116]/95 border-white/10 backdrop-blur-xl">
										<SelectItem
											value="all"
											className="text-white focus:bg-white/10"
										>
											Todos
										</SelectItem>
										{drivers.map((driver) => (
											<SelectItem
												key={driver.id}
												value={driver.id}
												className="text-white focus:bg-white/10"
											>
												{driver.name}
											</SelectItem>
										))}
										<div className="flex justify-between mt-2">
											<Button
												variant="outline"
												onClick={() => setDriverPage((prev) => Math.max(prev - 1, 1))}
												className="text-white"
												disabled={driverPage === 1}
											>
												Voltar
											</Button>
											<Button
												variant="outline"
												onClick={() => setDriverPage((prev) => prev + 1)}
												className="text-white"
												disabled={drivers.length < driversPerPage}
											>
												Próximo
											</Button>
										</div>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="rounded-md border border-white/20 overflow-x-auto">
				<Table>
					<TableHeader className="bg-white/5">
						<TableRow>
							<TableHead className="text-gray-300">Veículo</TableHead>
							<TableHead className="text-gray-300">Placa</TableHead>
							<TableHead className="text-gray-300">Motorista atual</TableHead>
							<TableHead className="text-gray-300 text-right">Combustivel</TableHead>
							<TableHead className="text-gray-300 text-right">Manutenção</TableHead>
							<TableHead className="text-gray-300 text-right">Pedágio</TableHead>
							<TableHead className="text-gray-300 text-right">Outros</TableHead>
							<TableHead className="text-gray-300">Status</TableHead>
							<TableHead className="text-gray-300">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{currentTrucks?.map((truck) => (
							<TableRow
								key={truck.id}
								className="cursor-pointer hover:bg-white/5 border-white/20"
								onClick={() => handleTruckClick(truck)}
							>
								<TableCell className="text-gray-300">{truck.name}</TableCell>
								<TableCell className="text-gray-300">{truck.plate}</TableCell>
								<TableCell>
									<div className="flex flex-col">
										<span className="text-gray-300">
											{truck.driver_name || "Unassigned"}
										</span>
									</div>
								</TableCell>
								<TableCell className="text-right text-gray-300">
									R$ {truck.combustivel_amount.toLocaleString()}
								</TableCell>
								<TableCell className="text-right text-gray-300">
									R$ {truck.manutencao_amount.toLocaleString()}
								</TableCell>
								<TableCell className="text-right text-gray-300">
									R$ {truck.pedagio_amount.toLocaleString()}
								</TableCell>
								<TableCell className="text-right text-gray-300">
									R$ {truck.outros_amount.toLocaleString()}
								</TableCell>
								<TableCell>
									<span
										className={`px-2 py-1 rounded-full text-xs ${truck.status === "active"
											? "bg-green-500/20 text-green-300"
											: truck.status === "maintenance"
												? "bg-yellow-500/20 text-yellow-300"
												: "bg-red-500/20 text-red-300"
											}`}
									>
										{truck.status}
									</span>
								</TableCell>
								<TableCell>
									<Button variant="ghost" size="icon" onClick={(e) => {
										e.stopPropagation();
										handleRemoveClick(truck);
									}}>
										<Trash2 className="w-4 h-4 text-red-500" />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex justify-between items-center mt-4">
				<Button
					variant="outline"
					onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
					disabled={currentPage === 1}
				>
					Anterior
				</Button>
				<span className="text-gray-300">
					Página {currentPage} de {totalPages}
				</span>
				<Button
					variant="outline"
					onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
					disabled={currentPage === totalPages}
				>
					Próxima
				</Button>
			</div>

			<AddTruckDialog
				open={isAddTruckOpen}
				onOpenChange={setIsAddTruckOpen}
			/>

			<ManageDriverDialog
				open={isAddDriverOpen}
				onOpenChange={setIsAddDriverOpen}
			/>

			<DeleteTruckDialog truckToRemove={truckToRemove} open={isRemoveModalOpen} onOpenChange={setIsRemoveModalOpen} onConfirmRemove={handleConfirmRemove} />

			<ViewDriversDialog
				open={isViewDriversOpen}
				onOpenChange={setIsViewDriversOpen}
			/>
		</Card>
	);
};

export default FleetTable;