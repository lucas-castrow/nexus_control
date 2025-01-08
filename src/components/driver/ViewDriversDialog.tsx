import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface Driver {
	id: string;
	name: string;
	cpf: string;
	phone: string;
}

interface ViewDriversDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const ViewDriversDialog = ({ open, onOpenChange }: ViewDriversDialogProps) => {
	const [drivers, setDrivers] = useState<Driver[]>([]);
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
	const [driverToRemove, setDriverToRemove] = useState<Driver | null>(null);

	const fetchDrivers = async () => {
		const { data, error } = await supabase.from("driver").select("id, name, cpf, phone");
		if (error) {
			console.error("Erro ao buscar motoristas:", error);
		} else {
			setDrivers(data);
		}
	};

	const handleRemoveDriver = async () => {
		if (driverToRemove) {
			const { error } = await supabase.from("driver").delete().eq("id", driverToRemove.id);
			if (error) {
				console.error("Erro ao remover motorista:", error);
			} else {
				setDrivers((prevDrivers) => prevDrivers.filter((driver) => driver.id !== driverToRemove.id));
				setIsConfirmDialogOpen(false);
				setDriverToRemove(null);
			}
		}
	};

	const openConfirmDialog = (driver: Driver) => {
		setDriverToRemove(driver);
		setIsConfirmDialogOpen(true);
	};

	useEffect(() => {
		if (open) {
			fetchDrivers();
		}
	}, [open]);

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-lg bg-black/80 border-white/10 backdrop-blur-xl text-white">
					<DialogTitle>Motoristas</DialogTitle>
					<div className="space-y-4 max-h-96 overflow-y-auto">
						{drivers.map((driver) => (
							<div key={driver.id} className="flex justify-between items-center">
								<div>
									<p className="text-gray-300">{driver.name}</p>
									<p className="text-sm text-gray-400">CPF: {driver.cpf}</p>
									<p className="text-sm text-gray-400">Telefone: {driver.phone}</p>
								</div>
								<Button variant="ghost" size="icon" onClick={() => openConfirmDialog(driver)}>
									<Trash2 className="w-4 h-4 text-red-500" />
								</Button>
							</div>
						))}
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
				<DialogContent className="max-w-md bg-black/80 border-white/10 backdrop-blur-xl text-white">
					<DialogTitle>Confirmar Remoção</DialogTitle>
					<p>Você realmente deseja remover o motorista {driverToRemove?.name} do registro?</p>
					<div className="flex justify-end space-x-4 mt-4">
						<Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
							Cancelar
						</Button>
						<Button variant="destructive" onClick={handleRemoveDriver}>
							Remover
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};