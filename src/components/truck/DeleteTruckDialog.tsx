import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface TruckData {
	id: string;
	name: string;
	plate: string;
}

interface DeleteTruckDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	truckToRemove: TruckData | null;
	onConfirmRemove: () => void;
}

export function DeleteTruckDialog({
	open,
	onOpenChange,
	truckToRemove,
	onConfirmRemove,
}: DeleteTruckDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg bg-black/80 border-white/10 backdrop-blur-xl text-white">
				<DialogHeader>
					<DialogTitle>Remover {truckToRemove?.name} ({truckToRemove?.plate}) </DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<p>Tem certeza que deseja remover o caminhão?</p>
					<div className="flex justify-end space-x-2">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Cancelar
						</Button>
						<Button variant="destructive" onClick={onConfirmRemove}>
							Remover
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}