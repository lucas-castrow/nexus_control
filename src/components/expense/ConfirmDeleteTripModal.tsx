import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

interface ConfirmDeleteTripModalProps {
	trip: any;
	onClose: () => void;
	onConfirm: () => void;
}

const ConfirmDeleteTripModal: React.FC<ConfirmDeleteTripModalProps> = ({ trip, onClose, onConfirm }) => {
	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="max-w-lg bg-black/80 border-white/10 backdrop-blur-xl text-white">
				<DialogHeader>
					<DialogTitle>Confirmar Exclusão</DialogTitle>
				</DialogHeader>
				<div className="p-4 text-center">
					<p className="mb-4">Você deseja realmente deletar essa viagem de {trip.origin} até {trip.destination}?</p>
					<p className="mb-4">Todos os custos registrados dessa viagem serão deletados, bem como os valores de frete recebidos.</p>
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

export default ConfirmDeleteTripModal;