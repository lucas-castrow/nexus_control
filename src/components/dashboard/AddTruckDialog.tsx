import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

interface Driver {
	id: string;
	name: string;
	cpf: string;
	phone: string;
}

interface AddTruckDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit?: (truck: { name: string; plate: string; driver: Driver; status: string }) => void;
}

export function AddTruckDialog({
	open,
	onOpenChange,
}: AddTruckDialogProps) {
	const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
	const [plate, setPlate] = useState("");

	useEffect(() => {
		const fetchDrivers = async () => {
			const { data, error } = await supabase
				.from("driver")
				.select("*");

			if (error) {
				console.error("Erro ao buscar motoristas:", error);
			} else {
				setAvailableDrivers(data);
			}
		};

		fetchDrivers();
	}, []);

	const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPlate(e.target.value.toUpperCase());
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const driverId = formData.get("driver") as string;
		const selectedDriver = availableDrivers.find((d) => d.id === driverId);

		if (!selectedDriver) return;

		const truckData = {
			name: formData.get("name") as string,
			plate: formData.get("plate") as string,
			current_driver_id: selectedDriver.id,
			status: formData.get("status") as string,
		};

		const { data, error } = await supabase
			.from("truck")
			.insert([truckData]);

		if (error) {
			console.error("Erro ao adicionar caminhão:", error);
		} else {
			onOpenChange(false);
			// onSubmit({
			// 	name: truckData.name,
			// 	plate: truckData.plate,
			// 	driver: selectedDriver,
			// 	status: truckData.status,
			// });
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Novo caminhão</DialogTitle>
					<DialogDescription>
						Novo caminhão para controle de gastos
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Nome do veículo</Label>
							<Input
								id="name"
								name="name"
								placeholder="Veículo"
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="plate">Placa do caminhão</Label>
							<Input
								id="plate"
								name="plate"
								placeholder="Placa do caminhão"
								value={plate}
								onChange={handlePlateChange}
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="driver">Selecione o atual/último motorista</Label>
							<Select name="driver" required>
								<SelectTrigger>
									<SelectValue placeholder="Selecione o motorista" />
								</SelectTrigger>
								<SelectContent>
									{availableDrivers.map((driver) => (
										<SelectItem key={driver.id} value={driver.id}>
											<div className="flex flex-col">
												<span>{driver.name}</span>
												<span className="text-xs text-gray-500">
													CPF: {driver.cpf} • Phone: {driver.phone}
												</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="status">Status</Label>
							<Select name="status" defaultValue="active">
								<SelectTrigger>
									<SelectValue placeholder="Selecione status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="active">Ativo</SelectItem>
									<SelectItem value="maintenance">Manutenção</SelectItem>
									<SelectItem value="inactive">Inativo</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit">Adicionar</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}