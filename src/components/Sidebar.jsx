// components/Sidebar.jsx
import { useState } from "react";
import { CaretRightIcon } from "@phosphor-icons/react";
import { UserFocusIcon, ArrowsClockwiseIcon, XIcon } from '@phosphor-icons/react';
import { getCurrentDate, getCurrentTime } from "../utils/dateHelpers";
import StopArrivals from "./StopArrivals";
import Logo from "../assets/logo-gautte.svg";

export default function Sidebar({ isOpen, onToggle, onDateChange, onTimeChange, selectedStop, stopArrivals, arrivalsLoading, onLocate, onReset, onCloseLine, showCloseLine }) {
	const [date, setDate] = useState(getCurrentDate());
	const [time, setTime] = useState(getCurrentTime());

	const handleDateChange = (e) => {
		setDate(e.target.value);
		onDateChange?.(e.target.value);
	};

	const handleTimeChange = (e) => {
		setTime(e.target.value);
		onTimeChange?.(e.target.value);
	};

	return (
		<>
			{/* Sidebar drawer with slide animation */}
			<aside
				className={`
        absolute left-2 top-0 z-20 my-2
        bg-white flex flex-col rounded-2xl
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        w-fit shadow-lg
      `}
				style={{ height: `calc(100dvh - 1rem)` }}
      >
				<div className="p-6 border-b border-gray-200 flex flex-col">
					<div className="flex justify-start items-start">
						<img src={Logo} alt="GAUTTE" className="h-[100px] w-auto object-contain" />
					</div>

					<p className="text-xs text-gray-500 mt-2">Versione 0.30.5</p>
				</div>

				<div className="p-5 border-b border-gray-200 w-full">
					<div className="space-y-3">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Orario</label>
							<input
								type="time"
								value={time}
								onChange={handleTimeChange}
								className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
							<input
								type="date"
								value={date}
								onChange={handleDateChange}
								className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
					</div>
				</div>

				<div className="p-5 flex-1 w-full flex flex-col min-h-0">
					<h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Prossimi arrivi</h2>

					<div
						className="flex-1 min-h-0">
						<StopArrivals stop={selectedStop} arrivals={stopArrivals} loading={arrivalsLoading} />
					</div>
				</div>

				{/* Buttons */}

        <button
					onClick={onToggle}
					className={`
          absolute top-1/2 -translate-y-1/2 z-10
          bg-white rounded-r-lg shadow-lg
          px-2 py-4 hover:bg-gray-100 transition-all duration-300
          right-0 translate-x-full
        `}>
					<CaretRightIcon
						size={20}
						weight="bold"
						className={`
            transition-transform duration-300
            ${isOpen ? "rotate-180" : "rotate-0"}
          `}
					/>
				</button>


        {/* Control buttons - top left */}
			<div className="absolute top-4 right-0 z-10 flex flex-col gap-2" style={{transform: "translateX(calc(100% + .5rem))"}}>
				<button 
					onClick={onReset}
					className="p-2 rounded-md bg-white shadow-sm hover:bg-blue-500 hover:text-white text-gray-700 transition-colors"
					title="Reimposta vista"
				>
					<ArrowsClockwiseIcon size={24} />
				</button>

				<button 
					onClick={onLocate}
					className="p-2 rounded-md bg-white shadow-sm hover:bg-blue-500 hover:text-white text-gray-700 transition-colors"
					title="Centra sulla posizione"
				>
					<UserFocusIcon size={24} weight="fill" />
				</button>
			</div>
			</aside>

      {/* Close line button - bottom center */}
			{showCloseLine && (
				<button 
					onClick={onCloseLine}
					className="absolute w-fit whitespace-nowrap bottom-4 left-1/2 -translate-x-1/2 z-10 pl-2 pr-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm font-medium flex items-center gap-2 shadow-lg"
				>
					<XIcon size={18} weight="bold" />
					Chiudi linea
				</button>
			)}
		</>
	);
}
