// components/Sidebar.jsx
import { useState } from "react";
import { CaretRightIcon, UserFocusIcon, ArrowCounterClockwiseIcon, XIcon } from "@phosphor-icons/react";
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
			<aside className="h-screen w-screen absolute left-0 top-0 flex">
				<div
					className={`overflow-hidden z-40 relative transition-all duration-300 ease-in-out bg-white rounded-2xl m-2 shadow-lg ${isOpen ? "max-w-100" : "max-w-0 ml-0"}`}
					style={{ height: "calc(100% - 1rem)" }}>
					<div className="max-w-fit h-full overflow-hidden flex flex-col">
						<div className="p-5 relative right-0 border-b border-gray-200 flex flex-col">
							<img src={Logo} alt="GAUTTE" className="h-[100px] w-fit min-w-fit" />

							<p className="text-xs text-gray-500 mt-2 whitespace-nowrap">Versione 0.4-alpha</p>
						</div>

						<div className="p-5 relative right-0 border-b border-gray-200">
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

						<div className="p-5 relative right-0 flex-1 flex flex-col min-h-0">
							<h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 whitespace-nowrap">Prossimi arrivi</h2>

							<div className="flex-1 min-h-0 overflow-y-auto">
								<StopArrivals stop={selectedStop} arrivals={stopArrivals} loading={arrivalsLoading} />
							</div>
						</div>
					</div>
				</div>
				<div className="h-full relative z-20">
					<div className="absolute h-screen bg-white -left-6" style={{ width: "1.5rem" }}></div>
					<div
						className="absolute h-screen -left-2 fake-border-map pointer-events-none"
						style={{ borderColor: "white", borderWidth: "0.5rem 0px 0.5rem 0.5rem", borderRadius: "1.5rem 0 0 1.5rem", width: "1.5rem" }}></div>
					<div className="flex absolute top-1/2 -translate-y-1/2 z-40 items-center overflow-hidden bg-red" style={{ width: "100px", height: "100px" }}>
						<button
							onClick={onToggle}
							className={`
								bg-white rounded-r-lg shadow-sm h-fit
								px-2 py-4 text-gray-500 hover:bg-gray-100 hover:text-gray-600 transition-all duration-300 flex justify-center items-center
								-left-2
								`}
							style={{ width: "3rem", height: "3rem" }}>
							<CaretRightIcon
								size={22}
								weight="fill"
								className={`
									transition-transform duration-300
									${isOpen ? "rotate-180" : "rotate-0"}
								`}
							/>
						</button>
					</div>

					{/* Control buttons - top left */}
					<div className="absolute top-4 left-2 z-10 flex flex-col gap-2">
						<button
							onClick={onReset}
							className="p-2 rounded-lg bg-white shadow-sm hover:bg-blue-500 hover:text-white text-gray-500 transition-colors"
							title="Reimposta vista">
							<ArrowCounterClockwiseIcon size={24} weight="bold" />
						</button>

						<button
							onClick={onLocate}
							className="p-2 rounded-lg bg-white shadow-sm hover:bg-blue-500 hover:text-white text-gray-500 transition-colors"
							title="Centra sulla posizione">
							<UserFocusIcon size={24} weight="bold" />
						</button>
					</div>
					{showCloseLine && (
				<button
					onClick={onCloseLine}
					className="absolute w-fit whitespace-nowrap bottom-4 left-2 z-10 pl-2 pr-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium flex items-center gap-2 shadow-md transition-colors">
					<XIcon size={22} weight="bold" />
					Chiudi linea
				</button>
			)}
				</div>
				
			</aside>
			{/* Buttons */}
		</>
	);
}
