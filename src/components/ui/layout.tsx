import React from "react";

interface LayoutProps {
	children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
	return (
		<div className="min-h-screen relative bg-[#0F1116]">
			{/* Subtle gradient background */}
			<div className="fixed inset-0">
				<div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />

				{/* Grid pattern */}
				<div
					className="absolute inset-0 opacity-5"
					style={{
						backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
						backgroundSize: "24px 24px",
					}}
				/>
			</div>

			{/* Content */}
			<div className="relative z-10">{children}</div>
		</div>
	);
}
