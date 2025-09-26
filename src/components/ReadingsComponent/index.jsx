import { useEffect, useState } from "react";
import Header from "../HeaderComponent";
import { Trash2, Edit, Plus, Eye } from "lucide-react";
import { useForm } from "react-hook-form";

export default function ReadingsPage() {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    
    const [readings, setReadings] = useState([]);
    const [filteredReadings, setFilteredReadings] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedReading, setSelectedReading] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");
    const [readingToDelete, setReadingToDelete] = useState(null);
    const [periodFilter, setPeriodFilter] = useState(null);


    {/* hook-form initialiazer */}
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    
    {/* fetching all 'readings' in backend */}
    const fetchReadings = () => {
        fetch(`${API_BASE_URL}/leituras/`)
            .then(res => {
                if (!res.ok) {
                    if (res.status === 404) return [];
                    throw new Error("Failed to fetch readings");
                }
                return res.json();
            })
            .then(data => {
                setReadings(data);
                setFilteredReadings(data);
            })
            .catch(err => {
                console.error(err);
                setReadings([]);
                setFilteredReadings([]);
            });
    };

    useEffect(() => {
        fetchReadings();
    }, []);

    
    {/* filter methods (search/days period) */}
    useEffect(() => {
        let filtered = readings.filter(r =>
            String(r.id).includes(search) || String(r.gasometro).includes(search)
        );
        if (periodFilter) {
            filtered = filtered.filter(r => r.periodicidade === periodFilter);
        }
        setFilteredReadings(filtered);
        setCurrentPage(1);
    }, [search, readings, periodFilter]);


    {/* opening form in edit || insert mode */}
    const handleOpenForm = (reading = null) => {
        if (reading) {
            setIsEditing(true);
            setSelectedReading(reading);
            reset({
                data_leitura: reading.data_leitura,
                consumo_m3: reading.consumo_m3,
                periodicidade: reading.periodicidade,
                gasometro: reading.gasometro
            });
        } else {
            setIsEditing(false);
            setSelectedReading(null);
            reset({
                data_leitura: "",
                consumo_m3: "",
                periodicidade: "MENSAL",
                gasometro: ""
            });
        }
        setShowFormModal(true);
    };


    {/* clearing fields by closing modal */}
    const handleCloseForm = () => {
        setSelectedReading(null);
        setShowFormModal(false);
    };


    {/* toast label which shows messages to user */}
    const showToast = (message, type = "success") => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(""), 5000);
    };


    {/* reading delete method */}
    const confirmDelete = (reading) => setReadingToDelete(reading);

    const handleDelete = () => {
        if (!readingToDelete) return;
        fetch(`${API_BASE_URL}/leituras/${readingToDelete.id}/`, {
            method: "DELETE",
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to delete reading");
                fetchReadings();
                showToast("Reading successfully deleted");
            })
            .catch(err => showToast("Failed to delete reading", "error"))
            .finally(() => setReadingToDelete(null));
    };

    
    {/* edit/insert method
        just like the modal,
        if isEditing then just
        update values, else we
        are inserting a new item */}
    const onSubmit = (data) => {
        const payload = {
            gasometro: Number(data.gasometro),
            data_leitura: data.data_leitura,
            consumo_m3: Number(data.consumo_m3),
            periodicidade: data.periodicidade
        };

        if (isEditing && selectedReading) {
            fetch(`${API_BASE_URL}/leituras/${selectedReading.id}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
                .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e)))
                .then(() => {
                    fetchReadings();
                    showToast("Reading successfully edited");
                })
                .catch(err => showToast("Failed to edit reading", "error"));
        } else {
            fetch(`${API_BASE_URL}/leituras/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
                .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e)))
                .then(() => {
                    fetchReadings();
                    showToast("Reading successfully created");
                })
                .catch(err => {
                    console.log(err);
                    showToast("Failed to create reading", "error")
                });
        }

        handleCloseForm();
    };

    
    {/* pagination */}
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredReadings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredReadings.length / itemsPerPage);


    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-[rgb(15,15,30)] via-[rgb(30,30,60)] to-[rgb(50,10,80)] text-white">
            <Header />

            <main className="p-8 flex-1 overflow-auto">
                
                {/* search input and create new reading button */}
                <div className="flex justify-between items-center mb-4">
                    <input
                        type="text"
                        placeholder="Search by reading ID or gasometer..."
                        className="px-3 py-2 rounded-lg text-black bg-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoComplete="off"
                    />
                    <button
                        onClick={() => handleOpenForm()}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg shadow transition active:scale-95 hover:cursor-pointer"
                    >
                        <Plus size={16} />
                        Add Reading
                    </button>
                </div>


                {/* Periodicity filter */}
                <div className="flex gap-4 mb-6">
                    {["SEMANAL", "MENSAL", "BIMESTRAL", "SEMESTRAL"].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriodFilter(prev => prev === p ? null : p)}
                            className={`px-4 py-2 rounded-lg font-bold transition-colors hover:cursor-pointer ${
                                periodFilter === p
                                    ? "bg-purple-600 text-white"
                                    : "bg-white/20 text-white hover:bg-white/30"
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>


                {/* toast message section */}
                {toastMessage && (
                    <div
                        className={`mb-4 p-3 rounded shadow-md transition-opacity duration-500 ${toastType === "success"
                            ? "bg-green-600 text-white"
                            : "bg-red-600 text-white"
                            }`}
                    >
                        {toastMessage}
                    </div>
                )}


                {/* if there's no cards based on a search,
                    render this warning div  */}
                {filteredReadings.length === 0 && (
                    <p className="text-center text-gray-400 mt-6">No results found! Please edit your query.</p>
                )}


                {/* readings info cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentItems.map((r) => (
                        <div key={r.id} className="bg-white/10 backdrop-blur-lg p-4 rounded-xl shadow-md flex flex-col justify-between">
                            <div>
                                <p className="text-sm text-gray-300">Reading ID: {r.id}</p>
                                <p className="text-sm text-gray-300">Gasometer ID: {r.gasometro}</p>
                                <p className="text-sm text-gray-300">Reading Date: {r.data_leitura}</p>
                                <p className="text-sm text-gray-300">Consumption (m³): {r.consumo_m3}</p>
                                <p className="text-sm text-gray-300">Periodicity: {r.periodicidade}</p>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setSelectedReading(r)}
                                    className="bg-blue-500 px-2 py-1 rounded hover:bg-blue-400 hover:cursor-pointer"
                                >
                                    <Eye size={16} />
                                </button>
                                <button
                                    onClick={() => handleOpenForm(r)}
                                    className="bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-400 hover:cursor-pointer"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => confirmDelete(r)}
                                    className="bg-red-600 px-2 py-1 rounded hover:bg-red-500 hover:cursor-pointer"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>


                {/* pagination part */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-gray-500 rounded disabled:opacity-50 hover:cursor-pointer"
                        >
                            Prev
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-purple-600" : "bg-gray-500 hover:cursor-pointer"}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 bg-gray-500 rounded disabled:opacity-50 hover:cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                )}


                {/* form modal (same for create/edit)
                    working with hook-form  */}
                {showFormModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl w-[400px]">
                            <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Reading" : "Add Reading"}</h2>
                            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                                <div className="flex flex-col">
                                    <label className="text-gray-300">Gasometer ID</label>
                                    <input
                                        type="number"
                                        {...register("gasometro", { required: "Gasometer ID is required" })}
                                        className={`px-3 py-2 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.gasometro ? "ring-2 ring-red-500" : ""}`}
                                    />
                                    {errors.gasometro && <span className="text-red-400 text-sm">{errors.gasometro.message}</span>}
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-gray-300">Reading Date</label>
                                    <input
                                        type="date"
                                        max={new Date().toISOString().split("T")[0]}
                                        {...register("data_leitura", {
                                            required: "Reading Date cannot be blank",
                                            validate: value => {
                                                const selected = new Date(value);
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);
                                                if (selected > today) return "Reading Date cannot be in the future";
                                                return true;
                                            }
                                        })}
                                        className={`px-3 py-2 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.data_leitura ? "ring-2 ring-red-500" : ""}`}
                                    />
                                    {errors.data_leitura && <span className="text-red-400 text-sm">{errors.data_leitura.message}</span>}
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-gray-300">Consumption (m³)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        autoComplete="off"
                                        placeholder="0.00"
                                        {...register("consumo_m3", {
                                            required: "Consumption cannot be blank",
                                            min: { value: 0, message: "Consumption cannot be negative" }
                                        })}
                                        className={`px-3 py-2 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.consumo_m3 ? "ring-2 ring-red-500" : ""}`}
                                    />
                                    {errors.consumo_m3 && <span className="text-red-400 text-sm">{errors.consumo_m3.message}</span>}
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-gray-300">Periodicity</label>
                                    <select
                                        {...register("periodicidade", { required: "Periodicity is required" })}
                                        className={`px-3 py-2 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.periodicidade ? "ring-2 ring-red-500" : ""}`}
                                    >
                                        <option value="SEMANAL">SEMANAL</option>
                                        <option value="MENSAL">MENSAL</option>
                                        <option value="BIMESTRAL">BIMESTRAL</option>
                                        <option value="SEMESTRAL">SEMESTRAL</option>
                                    </select>
                                    {errors.periodicidade && <span className="text-red-400 text-sm">{errors.periodicidade.message}</span>}
                                </div>

                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseForm}
                                        className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-400 hover:cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500 hover:cursor-pointer"
                                    >
                                        {isEditing ? "Update" : "Create"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}


                {/* modal displaying reading card info */}
                {selectedReading && !showFormModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
                        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl w-[400px]">
                            <h2 className="text-xl font-bold mb-4">Reading Details</h2>
                            <p><strong>Reading ID:</strong> {selectedReading.id}</p>
                            <p><strong>Gasometer ID:</strong> {selectedReading.gasometro}</p>
                            <p><strong>Reading Date:</strong> {selectedReading.data_leitura}</p>
                            <p><strong>Consumption (m³):</strong> {selectedReading.consumo_m3}</p>
                            <p><strong>Periodicity:</strong> {selectedReading.periodicidade}</p>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setSelectedReading(null)}
                                    className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-400 hover:cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* delete confirmation modal */}
                {readingToDelete && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl w-[400px]">
                            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                            <p>Are you sure you want to delete the reading from <strong>{readingToDelete.data_leitura}</strong> (ID {readingToDelete.id})?</p>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => setReadingToDelete(null)}
                                    className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-400 hover:cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="bg-red-600 px-4 py-2 rounded hover:bg-red-500 hover:cursor-pointer"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
