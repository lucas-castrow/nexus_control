import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

interface ConfirmDeleteCostModalProps {
	cost: any;
	onClose: () => void;
	onConfirm: () => void;
}

const ConfirmDeleteCostModal: React.FC<ConfirmDeleteCostModalProps> = ({ cost, onClose, onConfirm }) => {
	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="bg-black/80 border-white/10 backdrop-blur-xl text-white">
				<DialogHeader>
					<DialogTitle>Confirmar Exclusão</DialogTitle>
				</DialogHeader>
				<div className="p-4 text-center">
					<p className="mb-4">Tem certeza que deseja excluir o custo "{cost.description}"?</p>
					<div className="flex justify-center gap-4">
						<Button onClick={onConfirm}>Sim</Button>
						<Button variant="outline" onClick={onClose}>
							Não
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmDeleteCostModal;