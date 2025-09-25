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

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    // Fetch gasometers
    const fetchGasometers = () => {
        fetch("http://localhost:8000/api/gasometros/")
            .then(res => res.json())
            .then(data => {
                setGasometers(data);
                setFilteredGasometers(data);
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchGasometers();
    }, []);

    // Filter by search
    useEffect(() => {
        const filtered = gasometers.filter(g =>
            g.codigo.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredGasometers(filtered);
    }, [search, gasometers]);

    const handleOpenForm = (gasometer = null) => {
        if (gasometer) {
            setIsEditing(true);
            setSelectedGasometer(gasometer);
            reset({ codigo: gasometer.codigo, apartamento: gasometer.apartamento });
        } else {
            setIsEditing(false);
            setSelectedGasometer(null);
            reset({
                codigo: "",
                apartamento: "",
            });
        }
        setShowFormModal(true);
    };

    const handleCloseForm = () => {
        setSelectedGasometer(null);
        setShowFormModal(false);
    };

    const onSubmit = (data) => {
        const payload = {
            codigo: data.codigo,
            apartamento: Number(data.apartamento),
        };

        if (isEditing && selectedGasometer) {
            fetch(`http://localhost:8000/api/gasometros/${selectedGasometer.id}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
                .then(res => res.ok ? res.json() : Promise.reject("Failed to update"))
                .then(fetchGasometers)
                .catch(err => console.error(err));
        } else {
            fetch("http://localhost:8000/api/gasometros/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
                .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e)))
                .then(fetchGasometers)
                .catch(err => console.error("Create error:", err));
        }

        handleCloseForm();
    };

    const handleDelete = (id) => {
        if (!confirm("Deseja realmente deletar este gasômetro?")) return;
        fetch(`http://localhost:8000/api/gasometros/${id}/`, {
            method: "DELETE",
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to delete gasometer");
                fetchGasometers();
            })
            .catch(err => console.error(err));
    };

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-[rgb(15,15,30)] via-[rgb(30,30,60)] to-[rgb(50,10,80)] text-white">
            <Header />

            <main className="p-8 flex-1 overflow-auto">
                <div className="flex justify-between items-center mb-6">
                    <input
                        type="text"
                        placeholder="Search by code..."
                        className="px-3 py-2 rounded-lg text-black bg-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        onClick={() => handleOpenForm()}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg shadow transition active:scale-95 hover:cursor-pointer"
                    >
                        <Plus size={16} />
                        Add Gasometer
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGasometers.map((g) => (
                        <div key={g.id} className="bg-white/10 backdrop-blur-lg p-4 rounded-xl shadow-md flex flex-col justify-between">
                            <div>
                                <p className="text-sm text-gray-300">Código</p>
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
                                    onClick={() => handleDelete(g.id)}
                                    className="bg-red-600 px-2 py-1 rounded hover:bg-red-500 hover:cursor-pointer"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {showFormModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl w-[400px]">
                            <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Gasometer" : "Add Gasometer"}</h2>
                            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                                <div className="flex flex-col">
                                    <label className="text-gray-300">Código</label>
                                    <input
                                        type="text"
                                        {...register("codigo", { required: "Código é obrigatório" })}
                                        className={`px-3 py-2 rounded-lg text-black bg-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.codigo ? "ring-2 ring-red-500" : ""}`}
                                    />
                                    {errors.codigo && <span className="text-red-400 text-sm">{errors.codigo.message}</span>}
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-gray-300">Apartamento</label>
                                    <input
                                        type="text"
                                        {...register("apartamento", { required: "Apartamento é obrigatório" })}
                                        className={`px-3 py-2 rounded-lg text-black bg-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.apartamento ? "ring-2 ring-red-500" : ""}`}
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

                {selectedGasometer && !showFormModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
                        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl w-[400px]">
                            <h2 className="text-xl font-bold mb-4">Gasometer Details</h2>
                            <p><strong>Código:</strong> {selectedGasometer.codigo}</p>
                            <p><strong>Apartamento:</strong> {selectedGasometer.apartamento_info || selectedGasometer.apartamento}</p>

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

            </main>
        </div>
    );
}
