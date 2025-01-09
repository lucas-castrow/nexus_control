import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Truck, Lock, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { setProfile, startLoading } from "@/store/slices/profile-slice";
import { useAppDispatch } from "@/store/hooks";

export default function Login() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const dispatch = useAppDispatch();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			dispatch(startLoading());
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});


			if (error) {
				setError(error.message);
				setLoading(false);
				return;
			}


			navigate("/dashboard");
		} catch (err) {
			console.error("Erro no login:", err);
			setError("Erro ao realizar o login. Verifique suas credenciais.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl animate-blob1 -top-32 -left-32" />
				<div className="absolute w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl animate-blob2 top-full -right-32" />
				<div className="absolute w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl animate-blob3 -bottom-32 left-1/2" />

				{/* Grid overlay */}
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), 
              linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
						backgroundSize: "50px 50px",
					}}
				/>
			</div>

			<Card className="w-full max-w-md p-8 space-y-8 bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-2xl relative overflow-hidden">
				<div className="text-center space-y-2">
					<div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]">
						<div className="w-full h-full rounded-2xl bg-black/40 flex items-center justify-center">
							<Truck className="w-10 h-10 text-white" />
						</div>
					</div>
					<h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
						NexusControl
					</h2>
					<p className="text-gray-400">Sistema de gerenciamento de custos</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-4">
						<div className="relative">
							<Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
							<Input
								type="email"
								placeholder="Email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20"
							/>
						</div>
						<div className="relative">
							<Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
							<Input
								type="password"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20"
							/>
						</div>
					</div>

					<div className="flex items-center justify-between">
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								className="rounded border-white/20 bg-white/10 text-blue-500"
							/>
							<span className="text-sm text-gray-300">Lembrar-me</span>
						</label>
						<a
							href="#"
							className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
						>
							Esqueceu a senha?
						</a>
					</div>

					<Button
						type="submit"
						className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
						disabled={loading}
					>
						{loading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Entrando...
							</>
						) : (
							"Entrar no sistema"
						)}
					</Button>

					{error && <p className="text-red-500 text-sm mt-2">{error}</p>}
				</form>
			</Card>

			<style>{`
        @keyframes blob1 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(100px, 100px) scale(1.2);
          }
          66% {
            transform: translate(-50px, 50px) scale(0.8);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
        @keyframes blob2 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-100px, -100px) scale(0.8);
          }
          66% {
            transform: translate(50px, -50px) scale(1.2);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
        @keyframes blob3 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(50px, -50px) scale(1.2);
          }
          66% {
            transform: translate(-100px, 100px) scale(0.8);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
        .animate-blob1 {
          animation: blob1 20s infinite;
        }
        .animate-blob2 {
          animation: blob2 25s infinite;
        }
        .animate-blob3 {
          animation: blob3 30s infinite;
        }
      `}</style>
		</div>
	);
}
