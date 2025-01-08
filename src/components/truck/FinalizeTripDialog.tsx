import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FinalizeTripDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onFinalize: (endKm: number) => void;
	startKm: number;
}

export function FinalizeTripDialog({
	open,
	onOpenChange,
	onFinalize,
	startKm,
}: FinalizeTripDialogProps) {
	const [endKm, setEndKm] = useState<number | "">("");
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (typeof endKm === "number" && endKm >= startKm) {
			onFinalize(endKm);
		} else {
			setError("O KM final não pode ser menor que o KM inicial.");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px] bg-black/40 border-white/10 backdrop-blur-xl text-white">
				<DialogHeader>
					<DialogTitle>Finalizar Trajeto</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="endKm">KM Final</Label>
							<Input
								id="endKm"
								name="endKm"
								type="number"
								placeholder="KM Final"
								value={endKm}
								onChange={(e) => setEndKm(Number(e.target.value))}
								required
								className="bg-white/10 border-white/20 text-white"
							/>
							{error && <p className="text-red-500">{error}</p>}
						</div>
					</div>
					<DialogFooter>
						<Button type="submit">Finalizar</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}