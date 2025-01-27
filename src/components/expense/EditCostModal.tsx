import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { supabase } from "@/lib/supabase";

interface CostEntry {
	id?: string;
	amount: number;
	category: string;
	description: string;
	trip?: {
		id: string;
		origin: string;
		destination: string;
		comissao: any;
	};
}

interface EditCostModalProps {
	cost: CostEntry;
	onClose: () => void;
	onSave: () => void;
}

const EditCostModal: React.FC<EditCostModalProps> = ({ cost, onClose, onSave }) => {
	const [origin, setOrigin] = useState(cost.trip?.origin || "");
	const [destination, setDestination] = useState(cost.trip?.destination || "");
	const [amount, setAmount] = useState(cost.amount);
	const [description, setDescription] = useState(cost.description);

	const handleSave = async () => {
		try {
			const { error } = await supabase
				.from("expense")
				.update({ description, amount })
				.eq("id", cost.id);

			if (error) throw error;

			if (cost.trip) {
				if (cost.category === "comissao") {
					const { error: tripError } = await supabase
						.from("trip")
						.update({ origin, destination, comissao: amount })
						.eq("id", cost.trip.id);
					if (tripError) throw tripError;
				} else {
					const { error: tripError } = await supabase
						.from("trip")
						.update({ origin, destination })
						.eq("id", cost.trip.id);
					if (tripError) throw tripError;
				}
			}

			onSave();
			onClose();
		} catch (error) {
			console.error("Erro ao editar custo:", error);
		}
	};

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="max-w-lg bg-black/80 border-white/10 backdrop-blur-xl text-white">
				<DialogHeader>
					<DialogTitle>Editar Custo</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<label>
						Descrição
						<Input
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</label>
					<label>
						Origem
						<Input
							value={origin}
							onChange={(e) => setOrigin(e.target.value)}
						/>
					</label>
					<label>
						Destino
						<Input
							value={destination}
							onChange={(e) => setDestination(e.target.value)}
						/>
					</label>
					<label>
						Valor
						<Input
							type="number"
							value={amount}
							onChange={(e) => setAmount(parseFloat(e.target.value))}
						/>
					</label>
					<div className="flex justify-end space-x-4">
						<Button variant="outline" onClick={onClose}>
							Cancelar
						</Button>
						<Button onClick={handleSave}>
							Salvar
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default EditCostModal;