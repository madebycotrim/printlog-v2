export function PaginaInicial() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Painel de Controle</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900 mb-2">Impressoras Ativas</h2>
                    <p className="text-3xl font-bold text-blue-600">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900 mb-2">Projetos em Andamento</h2>
                    <p className="text-3xl font-bold text-yellow-600">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900 mb-2">Faturamento Mensal</h2>
                    <p className="text-3xl font-bold text-green-600">R$ 0,00</p>
                </div>
            </div>
        </div>
    );
}
