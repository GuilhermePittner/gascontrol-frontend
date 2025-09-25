import { useEffect, useState } from "react";
import Header from "../HeaderComponent";
import { Trash2, Edit, Plus, Eye } from "lucide-react";
import { useForm } from "react-hook-form";

export default function GasometersPage() {
    const [gasometers, setGasometers] = useState([]);
    const [filteredGasometers, setFilteredGasometers] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedGasometer, setSelectedGasometer] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success"); // "success" ou "error"
    const [gasometerToDelete, setGasometerToDelete] = useState(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    // Fetch gasometers
    const fetchGasometers = () => {
        fetch("http://localhost:8000/api/gasometros/")
            .then(res => {
                if (!res.ok) {
                    if (res.status === 404) return [];
                    throw new Error("Failed to fetch gasometers");
                }
                return res.json();
            })
            .then(data => {
                setGasometers(data);
                setFilteredGasometers(data);
            })
            .catch(err => {
                console.error(err);
                setGasometers([]);
                setFilteredGasometers([]);
            });
    };

    useEffect(() => {
        fetchGasometers();
    }, []);

    // Filter by search (code or ID)
    useEffect(() => {
        const filtered = gasometers.filter(g =>
            g.codigo.toLowerCase().includes(search.toLowerCase()) ||
            String(g.id) === search
        );
        setFilteredGasometers(filtered);
        setCurrentPage(1); // reset page on search
    }, [search, gasometers]);

    const handleOpenForm = (gasometer = null) => {
        if (gasometer) {
            setIsEditing(true);
            setSelectedGasometer(gasometer);
            reset({ codigo: gasometer.codigo, apartamento: gasometer.apartamento });
        } else {
            setIsEditing(false);
            setSelectedGasometer(null);
            reset({ codigo: "", apartamento: "" });
        }
        setShowFormModal(true);
    };

    const handleCloseForm = () => {
        setSelectedGasometer(null);
        setShowFormModal(false);
    };

    const showToast = (message, type = "success") => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(""), 5000);
    };

    const onSubmit = (data) => {
        const payload = { codigo: data.codigo, apartamento: Number(data.apartamento) };

        if (isEditing && selectedGasometer) {
            fetch(`http://localhost:8000/api/gasometros/${selectedGasometer.id}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
                .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e)))
                .then(() => {
                    fetchGasometers();
                    showToast("Gasometer successfully edited");
                })
                .catch(err => {
                    showToast("Failed to edit gasometer", "error")
                    showToast(`${err.apartamento[0]}`, "error")
                });
        } else {
            fetch("http://localhost:8000/api/gasometros/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
                .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e)))
                .then(() => {
                    fetchGasometers();
                    showToast("Gasometer successfully created");
                })
                .catch(err => {
                    showToast(`${err.apartamento[0]}`, "error")
                });
        }

        handleCloseForm();
    };

    const confirmDelete = (gasometer) => setGasometerToDelete(gasometer);

    const handleDelete = () => {
        if (!gasometerToDelete) return;
        fetch(`http://localhost:8000/api/gasometros/${gasometerToDelete.id}/`, {
            method: "DELETE",
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to delete gasometer");
                fetchGasometers();
                showToast("Gasometer successfully deleted");
            })
            .catch(err => showToast("Failed to delete gasometer", "error"))
            .finally(() => setGasometerToDelete(null));
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredGasometers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredGasometers.length / itemsPerPage);

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-[rgb(15,15,30)] via-[rgb(30,30,60)] to-[rgb(50,10,80)] text-white">
            <Header />

            <main className="p-8 flex-1 overflow-auto">
                {/* Search + Add button */}
                <div className="flex justify-between items-center mb-4">
                    <input
                        type="text"
                        placeholder="Search by code or ID..."
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
                        Add Gasometer
                    </button>
                </div>

                {/* Toast */}
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

                {/* Gasometers grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentItems.map((g) => (
                        <div key={g.id} className="bg-white/10 backdrop-blur-lg p-4 rounded-xl shadow-md flex flex-col justify-between">
                            <div>
                                <p className="text-sm text-gray-300">ID: {g.id}</p>
                                <p className="text-sm text-gray-300">Identification</p>
                                <p className="text-lg font-bold text-white">{g.codigo}</p>
                                <p className="text-sm text-gray-400">{g.apartamento_info || g.apartamento}</p>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setSelectedGasometer(g)}
                                    className="bg-blue-500 px-2 py-1 rounded hover:bg-blue-400 hover:cursor-pointer"
                                >
                                    <Eye size={16} />
                                </button>
                                <button
                                    onClick={() => handleOpenForm(g)}
                                    className="bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-400 hover:cursor-pointer"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => confirmDelete(g)}
                                    className="bg-red-600 px-2 py-1 rounded hover:bg-red-500 hover:cursor-pointer"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No results message */}
                {currentItems.length === 0 && (
                    <div className="text-center text-gray-300 mt-6 text-lg">
                        No results found! Please edit your query.
                    </div>
                )}

                {/* Pagination */}
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

                {/* Form Modal */}
                {showFormModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl w-[400px]">
                            <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Gasometer" : "Add Gasometer"}</h2>
                            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                                <div className="flex flex-col">
                                    <label className="text-gray-300">Code</label>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Gasometer code"
                                        {...register("codigo", { required: "Code cannot be blank" })}
                                        className={`px-3 py-2 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.codigo ? "ring-2 ring-red-500" : ""}`}
                                    />
                                    {errors.codigo && <span className="text-red-400 text-sm">{errors.codigo.message}</span>}
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-gray-300">Apartment</label>
                                    <input
                                        type="number"
                                        autoComplete="off"
                                        placeholder="1"
                                        {...register("apartamento", { required: "Apartment cannot be blank" })}
                                        className={`px-3 py-2 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.apartamento ? "ring-2 ring-red-500" : ""}`}
                                    />
                                    {errors.apartamento && <span className="text-red-400 text-sm">{errors.apartamento.message}</span>}
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

                {/* Details Modal */}
                {selectedGasometer && !showFormModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
                        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl w-[400px]">
                            <h2 className="text-xl font-bold mb-4">Gasometer Details</h2>
                            <p><strong>Code:</strong> {selectedGasometer.codigo}</p>
                            <p><strong>Apartment:</strong> {selectedGasometer.apartamento_info || selectedGasometer.apartamento}</p>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setSelectedGasometer(null)}
                                    className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-400 hover:cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {gasometerToDelete && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl w-[400px]">
                            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                            <p>Are you sure you want to delete gasometer <strong>{gasometerToDelete.codigo}</strong> (ID {gasometerToDelete.id})?</p>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => setGasometerToDelete(null)}
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
