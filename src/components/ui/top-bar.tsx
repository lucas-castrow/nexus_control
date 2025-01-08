import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setProfile } from "@/store/slices/profile-slice";
import { LogOut, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
}

export function TopBar({ }: TopBarProps) {
	const profile = useAppSelector((state) => state.profile.profile);
	const [copied, setCopied] = useState(false);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const baseUrl = import.meta.env.VITE_BASE_URL;

	const handleCopy = () => {
		navigator.clipboard.writeText(`${baseUrl}/${profile.company_id}/registro`).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
		});
	};


	const handleLogout = () => {
		supabase.auth.signOut();
		navigate('/login');
	};

	useEffect(() => {
		const fetchData = async () => {
			const { data: { user } } = await supabase.auth.getUser();

			if (!user) {
				navigate('/login');
				return;
			}

			const { data: userProfile, error: profileError } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", user.id)
				.single();
			if (userProfile && user) {
				dispatch(setProfile({ ...userProfile, email: user.email }));
			}
		};

		fetchData();
	}, []);
	return (
		<div className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0F1116]/80 backdrop-blur-xl">
			<div className="flex h-16 items-center px-4 md:px-6">
				<div className="flex items-center gap-4">
					<button
						onClick={() => navigate("/dashboard")}
						className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-300 transition-all"
					>
						Controle de gastos
					</button>
				</div>
				<div className="ml-auto flex items-center space-x-4">
					{/* <Button
						variant="ghost"
						size="icon"
						className="text-gray-400 hover:text-white hover:bg-white/10"
					>
						<Bell className="h-5 w-5" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="text-gray-400 hover:text-white hover:bg-white/10"
					>
						<Settings className="h-5 w-5" />
					</Button> */}


					<Button
						variant="ghost"
						className="text-gray-400 hover:text-white hover:bg-white/10"
						onClick={handleCopy}
					>
						{copied ? "Link copiado!" : "Link para registro"}
					</Button>

					<Button
						variant="ghost"
						className="text-gray-400 hover:text-white hover:bg-white/10"
						onClick={() => navigate('/dashboard')}
					>
						Dashboard
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="relative h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 overflow-hidden"
							>
								<img src={profile?.avatar_url} alt="Profile Avatar" className="absolute inset-0 h-full w-full object-cover" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-56 bg-[#0F1116]/95 border-white/10 backdrop-blur-xl"
							align="end"
							forceMount
						>
							<DropdownMenuLabel className="font-normal">
								<div className="flex flex-col space-y-1">
									<p className="text-sm font-medium text-white">{profile?.full_name}</p>
									<p className="text-xs text-gray-400">{profile?.email}</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator className="bg-white/10" />
							<DropdownMenuItem
								className="text-gray-400 focus:text-white focus:bg-white/10"
								// onClick={onLogout}
								onClick={() => navigate('/organization')}
							>
								<Building2 className="mr-2 h-4 w-4" />
								<span>Organização</span>
							</DropdownMenuItem>

							<DropdownMenuItem
								className="text-gray-400 focus:text-white focus:bg-white/10"
								onClick={handleLogout}
							>
								<LogOut className="mr-2 h-4 w-4" />
								<span>Log out</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
	);
}
