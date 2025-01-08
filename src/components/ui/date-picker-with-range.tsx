"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function DatePickerWithRange({
	className,
	date,
	setDate,
	defaultPeriod,
}: {
	className?: string;
	date: DateRange | undefined;
	setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
	defaultPeriod: "lastMonth" | "thisMonth";
}) {
	const today = new Date();
	const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
	const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
	const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

	React.useEffect(() => {
		if (!date) {
			if (defaultPeriod === "lastMonth") {
				setDate({ from: firstDayOfLastMonth, to: lastDayOfLastMonth });
			} else {
				setDate({ from: firstDayOfCurrentMonth, to: today });
			}
		}
	}, [date, setDate, defaultPeriod, firstDayOfCurrentMonth, firstDayOfLastMonth, lastDayOfLastMonth, today]);

	return (
		<div className={cn("grid gap-2", className)}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id="date"
						variant={"outline"}
						className={cn(
							"w-[300px] justify-start text-left font-normal",
							!date && "text-muted-foreground",
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{date?.from ? (
							date.to ? (
								<>
									{format(date.from, "dd LLL, y", { locale: ptBR })} -{" "}
									{format(date.to, "dd LLL, y", { locale: ptBR })}
								</>
							) : (
								format(date.from, "dd LLL, y", { locale: ptBR })
							)
						) : (
							<span>Selecione uma data</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					{/* <DayPicker
						initialFocus
						mode="range"
						defaultMonth={date?.from}
						selected={date}
						onSelect={setDate}
						numberOfMonths={2}
						locale={ptBR}
					/> */}

					<DayPicker
						mode="range"
						selected={date}
						onSelect={setDate}
						numberOfMonths={1}
						defaultMonth={date?.from}
						className="rounded-lg"
						showOutsideDays
						locale={ptBR}
						classNames={{
							day: "text-gray-200 hover:bg-gray-600 hover:text-white",
							selected: "text-white bg-gray-600 hover:bg-gray-500",
							today: "text-yellow-400",
							month: "bg-gray-900 rounded-lg p-4",
							caption: "text-white text-lg font-semibold mb-4",
							head: "text-white font-medium",
							nav_button: "text-gray-400 hover:text-white",
							// chevron: `${defaultClassNames.chevron} fill-amber-500`
						}}
						styles={{
							day: { borderRadius: "50%", padding: "0.1px" },
							month: { backgroundColor: "#1f2937" },
							head: { color: "#ffffff !important" },
							caption: { color: "#ffffff !important", textAlign: "center" },
							month_caption: { color: "#ffffff" },
							weekday: { color: "#ffffff" },
						}}

					/>

				</PopoverContent>
			</Popover>
		</div>
	);
}