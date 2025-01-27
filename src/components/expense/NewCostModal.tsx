import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Input } from '../ui/input';
import { DollarSign, FileText, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import dayjs from "dayjs";
import CurrencyInput from 'react-currency-input-field';

const NewCostModal = ({ isOpen, onClose, truckId, company_id, onAdded }) => {
	const [images, setImages] = useState([]);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [trips, setTrips] = useState([]);
	const [selectedTrip, setSelectedTrip] = useState<string | null>("none");

	useEffect(() => {
		const fetchTrips = async () => {
			const { data: tripsData, error: tripsError } = await supabase
				.from("trip")
				.select("id, origin, destination, start_time")
				.eq("truck_id", truckId);

			if (tripsError) {
				setError("Erro ao buscar viagens.");
				return;
			}

			setTrips(tripsData);
		};

		if (isOpen) {
			fetchTrips();
		}
	}, [isOpen, truckId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const type = formData.get("type") as string;
		const description = formData.get("description") as string;
		const amount = formData.get("amount") as string;
		const amountNumber = parseFloat(amount.replace(/\./g, '').replace(',', '.'));

		const { data: expenseData, error: expenseError } = await supabase.from("expense").insert({
			type: type,
			description: description,
			amount: amountNumber,
			truck_id: truckId,
			company_id: company_id,
			trip_id: selectedTrip === "none" ? null : selectedTrip,
		}).select("id").single()

		if (expenseError) {
			setError("Erro ao registrar despesa.");
			return;
		}
		const expenseId = expenseData.id;

		for (const image of images) {
			const { data: uploadData, error: uploadError } = await supabase.storage
				.from("expense-images")
				.upload(`${expenseId}/${image.name}`, image);

			if (uploadError) {
				setError("Erro ao fazer upload da imagem.");
				return;
			}

			const imageUrl = supabase.storage
				.from("expense-images")
				.getPublicUrl(uploadData.path).data.publicUrl;

			const { error: imageError } = await supabase.from("expense_image").insert({
				url: imageUrl,
				expense_id: expenseId,
				company_id: company_id,
			});

			if (imageError) {
				setError("Erro ao salvar URL da imagem.");
				return;
			}
		}

		setMessage("Despesa registrada com sucesso!");
		setError(null);
		setImages([]);
		onAdded();
		(e.target as HTMLFormElement).reset();
		onClose();
	};

	const handleImageUpload = (event) => {
		const files = Array.from(event.target.files);
		setImages((prevImages) => [...prevImages, ...files]);
	};

	const removeImage = (index) => {
		setImages((prevImages) => prevImages.filter((_, i) => i !== index));
	};

	return (
		<>
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="max-w-lg bg-black/80 border-white/10 backdrop-blur-xl text-white">
					<DialogHeader>
						<DialogTitle>Registrar Novo Custo</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-6">
						{error && <div className="text-red-500">{error}</div>}
						{message && <div className="text-green-500">{message}</div>}
						<div className="space-y-4">
							<div className="grid gap-2">
								<Label htmlFor="trip" className="text-gray-300">
									Viagem
								</Label>
								<Select name="trip" value={selectedTrip} onValueChange={setSelectedTrip}>
									<SelectTrigger className="bg-white/10 border-white/20 text-white">
										<SelectValue placeholder="Selecione a viagem (opcional)" />
									</SelectTrigger>
									<SelectContent className="text-white bg-black/90 border-white/10">
										<SelectItem value="none" className="text-white">
											Nenhuma
										</SelectItem>
										{trips.map((trip) => (
											<SelectItem key={trip.id} value={trip.id} className="text-white">
												{trip.origin} → {trip.destination} ({dayjs(trip.start_time).format("DD/MM/YYYY HH:mm")})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="type" className="text-gray-300">
									Tipo de Despesa
								</Label>
								<Select name="type" required>
									<SelectTrigger className="bg-white/10 border-white/20 text-white">
										<SelectValue placeholder="Selecione o tipo de despesa" />
									</SelectTrigger>
									<SelectContent className="bg-black/90 border-white/10">
										<SelectItem value="pedagio" className="text-white">
											Pedágio
										</SelectItem>
										<SelectItem value="manutencao" className="text-white ">
											Manutenção
										</SelectItem>
										<SelectItem value="combustivel" className="text-white">
											Combustível
										</SelectItem>
										<SelectItem value="outros" className="text-white">
											Outros
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="amount" className="text-gray-300">
									<div className="flex items-center gap-2">
										<DollarSign className="w-4 h-4 text-gray-400" />
										Valor
									</div>
								</Label>
								<CurrencyInput
									id="amount"
									name="amount"
									placeholder="0.00"
									decimalSeparator=","
									groupSeparator="."
									required
									className="flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="description" className="text-gray-300">
									<div className="flex items-center gap-2">
										<FileText className="w-4 h-4 text-gray-400" />
										Descrição
									</div>
								</Label>
								<Input
									id="description"
									name="description"
									required
									placeholder="Digite a descrição da despesa"
									className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
								/>
							</div>

							<div className="space-y-4">
								<Label className="text-gray-300">
									<div className="flex items-center gap-2">
										<Upload className="w-4 h-4 text-gray-400" />
										Fotos do Recibo
									</div>
								</Label>

								<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
									{images.map((image, index) => (
										<div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
											<img
												src={URL.createObjectURL(image)}
												alt={`Receipt ${index + 1}`}
												className="w-full h-full object-cover"
											/>
											<button
												type="button"
												onClick={() => removeImage(index)}
												className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
											>
												<X className="w-4 h-4" />
											</button>
										</div>
									))}
									<label className="aspect-square rounded-lg border-2 border-dashed border-white/20 hover:border-white/40 transition-colors flex items-center justify-center cursor-pointer bg-white/5 hover:bg-white/10">
										<input
											type="file"
											accept="image/*"
											multiple
											onChange={handleImageUpload}
											className="hidden"
										/>
										<Upload className="w-6 h-6 text-gray-400" />
									</label>
								</div>
							</div>
						</div>

						<Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
							Registrar Despesa
						</Button>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default NewCostModal;