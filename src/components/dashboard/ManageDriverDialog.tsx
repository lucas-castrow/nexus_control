import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { UserPlus } from "lucide-react";
import InputMask from 'react-input-mask';
import { supabase } from "@/lib/supabase";

interface Driver {
	id: string;
	name: string;
	cpf: string;
	phone: string;
}

interface ManageDriverDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ManageDriverDialog({
	open,
	onOpenChange,
}: ManageDriverDialogProps) {
	const [activeTab, setActiveTab] = useState<"assign" | "add">("add");

	const handleAddDriver = async (e: React.FormEvent) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const newDriver = {
			name: formData.get("name") as string,
			cpf: formData.get("cpf") as string,
			phone: formData.get("phone") as string,
		};

		const { data, error } = await supabase
			.from("driver")
			.insert([newDriver]);

		if (error) {
			console.error("Erro ao adicionar motorista:", error);
		} else {
			console.log("Motorista adicionado com sucesso:", data);
		}

		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Adicionar motorista</DialogTitle>
				</DialogHeader>

				<Tabs
					value={activeTab}
					onValueChange={(v) => setActiveTab(v as "add")}
				>
					<TabsContent value="add">
						<form onSubmit={handleAddDriver} className="space-y-4">
							<div className="grid gap-4">
								<div className="grid gap-2">
									<Label htmlFor="name">Nome</Label>
									<Input
										id="name"
										name="name"
										placeholder="Nome do motorista"
										required
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="cpf">CPF</Label>
									<InputMask
										mask="999.999.999-99"
										maskChar=""
									>
										{(inputProps: any) => (
											<Input
												{...inputProps}
												id="cpf"
												name="cpf"
												placeholder="000.000.000-00"
												required
											/>
										)}
									</InputMask>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="phone">Telefone</Label>
									<InputMask
										mask="(99) 99999-9999"
										maskChar=""
									>
										{(inputProps: any) => (
											<Input
												{...inputProps}
												id="phone"
												name="phone"
												placeholder="(00) 00000-0000"
												required
											/>
										)}
									</InputMask>
								</div>
							</div>
							<DialogFooter>
								<Button type="submit">
									<UserPlus className="w-4 h-4 mr-2" />
									Adicionar
								</Button>
							</DialogFooter>
						</form>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}