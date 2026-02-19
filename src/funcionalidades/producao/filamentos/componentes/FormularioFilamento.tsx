import { useState } from 'react';
import type { Filamento } from '@/compartilhado/tipos_globais/modelos';
import { X, Save } from 'lucide-react';

type PropriedadesFormulario = {
    filamentoParaEditar?: Filamento;
    aoSalvar: (filamento: Omit<Filamento, 'id'>) => void;
    aoCancelar: () => void;
};

export function FormularioFilamento({ filamentoParaEditar, aoSalvar, aoCancelar }: PropriedadesFormulario) {
    const [marca, setMarca] = useState(filamentoParaEditar?.marca || '');
    const [material, setMaterial] = useState(filamentoParaEditar?.material || 'PLA');
    const [cor, setCor] = useState(filamentoParaEditar?.cor || '');
    const [corHex, setCorHex] = useState(filamentoParaEditar?.cor_hex || '#000000');
    const [pesoTotal, setPesoTotal] = useState(filamentoParaEditar?.peso_total_g || 1000);
    const [pesoRestante, setPesoRestante] = useState(filamentoParaEditar?.peso_restante_g || 1000);
    const [precoKg, setPrecoKg] = useState(filamentoParaEditar?.preco_kg || 0);

    function submeterFormulario(e: React.FormEvent) {
        e.preventDefault();

        aoSalvar({
            marca,
            material,
            cor,
            cor_hex: corHex,
            peso_total_g: pesoTotal,
            peso_restante_g: pesoRestante,
            preco_kg: precoKg
        });
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {filamentoParaEditar ? 'Editar Filamento' : 'Novo Filamento'}
                    </h2>
                    <button onClick={aoCancelar} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={submeterFormulario} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marca</label>
                            <input
                                type="text"
                                required
                                value={marca}
                                onChange={e => setMarca(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                placeholder="Ex: Voolt3D"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Material</label>
                            <select
                                value={material}
                                onChange={e => setMaterial(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 transition-all"
                            >
                                <option value="PLA">PLA</option>
                                <option value="ABS">ABS</option>
                                <option value="PETG">PETG</option>
                                <option value="TPU">TPU</option>
                                <option value="ASA">ASA</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Cor</label>
                            <input
                                type="text"
                                required
                                value={cor}
                                onChange={e => setCor(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                placeholder="Ex: Azul Cobalto"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cor Hexadecimal</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={corHex}
                                    onChange={e => setCorHex(e.target.value)}
                                    className="h-10 w-10 p-0 border-0 rounded-lg cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={corHex}
                                    onChange={e => setCorHex(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono uppercase bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Peso Total (g)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={pesoTotal}
                                onChange={e => setPesoTotal(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Peso Restante (g)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                max={pesoTotal}
                                value={pesoRestante}
                                onChange={e => setPesoRestante(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço do Carretel (R$)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={precoKg}
                            onChange={e => setPrecoKg(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                            placeholder="0,00"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={aoCancelar}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 dark:focus:ring-slate-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm flex items-center gap-2 transition-colors"
                        >
                            <Save size={18} />
                            Salvar Filamento
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
