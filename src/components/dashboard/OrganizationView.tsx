import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/ui/top-bar";
import { Layout } from "@/components/ui/layout";
import { Building2, Mail, FileText, ArrowRight, Truck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import InputMask from "react-input-mask"; // Adicione esta linha
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br'
dayjs.locale('pt-br');

interface Organization {
	id?: string;
	created_at?: Date;
	name: string;
	cnpj: string;
	email: string;
}

interface OrganizationViewProps {
	onSubmit?: (data: Organization) => void;
}

const OrganizationView = ({
	onSubmit,
}: OrganizationViewProps) => {
	const [organization, setOrganization] = useState<Organization | null>(null);

	useEffect(() => {
		const fetchOrg = async () => {
			const { data: org, error: error } = await supabase
				.from("company")
				.select("*")
				.single();

			setOrganization(org)
		};
		fetchOrg();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const name = formData.get("name") as string;
		const cnpj = formData.get("cnpj") as string;
		const email = formData.get("email") as string;

		try {
			// Adicionar registro da empresa
			const { data: company, error: companyError } = await supabase
				.from("company")
				.insert({ name, cnpj, email })
				.select("id, name, cnpj, email")
				.single();

			if (companyError) throw companyError;

			// Atualizar perfil do usuário com company_id
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				const { error: profileError } = await supabase
					.from("profiles")
					.update({ company_id: company.id })
					.eq("id", user.id);

				if (profileError) throw profileError;
			}

			// Atualizar estado da organização
			setOrganization(company);

			// Chamar callback onSubmit se fornecido
			onSubmit?.({ name, cnpj, email });
		} catch (error) {
			console.error("Erro ao criar organização ou atualizar perfil:", error);
		}
	};

	return (
		<Layout>
			<TopBar />
			<div className="min-h-[calc(100vh-4rem)] p-6 lg:p-8">
				<div className="max-w-6xl mx-auto">
					{organization ? (
						<div className="grid md:grid-cols-3 gap-6">
							<Card className="md:col-span-2 p-8 bg-black/40 border-white/10 backdrop-blur-xl">
								<div className="flex items-center gap-4 mb-6">
									<div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]">
										<div className="w-full h-full rounded-2xl bg-black/40 flex items-center justify-center">
											<Building2 className="w-8 h-8 text-white" />
										</div>
									</div>
									<div>
										<h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
											{organization?.name}
										</h2>
									</div>
								</div>

								<div className="space-y-6">
									<div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-1">
										<div className="flex items-center gap-2 text-gray-400 mb-2">
											<FileText className="w-4 h-4" />
											<span>CNPJ</span>
										</div>
										<p className="text-xl font-medium text-white">
											{organization?.cnpj}
										</p>
									</div>

									<div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-1">
										<div className="flex items-center gap-2 text-gray-400 mb-2">
											<Mail className="w-4 h-4" />
											<span>Email</span>
										</div>
										<p className="text-xl font-medium text-white">
											{organization?.email}
										</p>
									</div>
								</div>
							</Card>

							<Card className="p-6 bg-black/40 border-white/10 backdrop-blur-xl">
								<h3 className="text-lg font-semibold text-white mb-4">
									Informações
								</h3>
								<p className="text-sm text-gray-400 mb-4">
									Organização criada em {organization.created_at ? dayjs(organization.created_at).format('DD [de] MMMM [de] YYYY [às] HH:mm') : 'Data não disponível'}
								</p>
								<div className="space-y-4">
									{/* <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <Truck className="w-5 h-5 text-blue-400" />
                                            <div>
                                                <p className="text-sm text-gray-400">Caminhões</p>
                                                <p className="text-2xl font-bold text-white">12</p>
                                            </div>
                                        </div>
                                    </div> */}
									{/* Add more stats as needed */}
								</div>
							</Card>
						</div>
					) : (
						// Create Organization Form
						<div className="grid md:grid-cols-2 gap-8 items-start">
							<Card className="p-8 bg-black/40 border-white/10 backdrop-blur-xl order-2 md:order-1">
								<div className="flex items-center gap-4 mb-8">
									<div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]">
										<div className="w-full h-full rounded-2xl bg-black/40 flex items-center justify-center">
											<Building2 className="w-8 h-8 text-white" />
										</div>
									</div>
									<div>
										<h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
											Criar organização
										</h2>
										<p className="text-gray-400">
											Inicie o cadastro da sua organização.
										</p>
									</div>
								</div>

								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="space-y-2">
										<Label htmlFor="name" className="text-gray-300">
											<div className="flex items-center gap-2">
												<Building2 className="w-4 h-4 text-gray-400" />
												Nome da organização
											</div>
										</Label>
										<Input
											id="name"
											name="name"
											required
											placeholder="Nome de sua organização"
											className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="cnpj" className="text-gray-300">
											<div className="flex items-center gap-2">
												<FileText className="w-4 h-4 text-gray-400" />
												CNPJ
											</div>
										</Label>
										<InputMask
											id="cnpj"
											name="cnpj"
											required
											placeholder="00.000.000/0000-00"
											mask="99.999.999/9999-99"
											className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
										>
											{(inputProps) => <Input {...inputProps} />}
										</InputMask>
									</div>

									<div className="space-y-2">
										<Label htmlFor="email" className="text-gray-300">
											<div className="flex items-center gap-2">
												<Mail className="w-4 h-4 text-gray-400" />
												Email
											</div>
										</Label>
										<Input
											id="email"
											name="email"
											type="email"
											required
											placeholder="organizacao@exemplo.com"
											className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
										/>
									</div>

									<Button
										type="submit"
										className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
									>
										Criar organização
										<ArrowRight className="w-4 h-4 ml-2" />
									</Button>
								</form>
							</Card>

							<div className="order-1 md:order-2">
								<Card className="p-8 bg-black/40 border-white/10 backdrop-blur-xl mb-6">
									<h3 className="text-xl font-semibold text-white mb-4">
										Bem vindo ao NexusCost
									</h3>
									<p className="text-gray-400 mb-4">
										Antes de começar o gerenciamento de custos da sua organização, você precisa configurar o perfil da sua organização.
										Isso nos ajudará a fornecer:
									</p>
									<ul className="space-y-3">
										<li className="flex items-center gap-3 text-gray-300">
											<div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
												<span className="text-blue-400">1</span>
											</div>
											Controle de seus gastos
										</li>
										<li className="flex items-center gap-3 text-gray-300">
											<div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
												<span className="text-blue-400">2</span>
											</div>
											Gerenciamento de caminhões
										</li>
										<li className="flex items-center gap-3 text-gray-300">
											<div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
												<span className="text-blue-400">3</span>
											</div>
											Gerar reports
										</li>
									</ul>
								</Card>

								<Card className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-white/10 backdrop-blur-xl">
									<div className="flex items-center gap-3 text-white">
										<Truck className="w-5 h-5" />
										<p className="text-sm">
											Comece o gerenciamento de seus custos em segundos.
										</p>
									</div>
								</Card>
							</div>
						</div>
					)}
				</div>
			</div>
		</Layout>
	);
};

export default OrganizationView;