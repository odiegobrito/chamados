document.addEventListener('DOMContentLoaded', () => {
    const formNovoChamado = document.getElementById('formNovoChamado');
    const listaChamados = document.getElementById('listaChamados');
    const btnAbrirChamado = document.getElementById('btnAbrirChamado');
    const mensagemStatus = document.getElementById('mensagemStatus');

    // --- Função para salvar chamado no backend (com fetch) ---
    async function salvarChamadoNoBackend(dadosChamado) {
        btnAbrirChamado.disabled = true;
        btnAbrirChamado.textContent = 'Salvando...';
        mensagemStatus.textContent = 'Enviando chamado para o servidor...';
        mensagemStatus.className = 'mt-4 text-sm text-blue-600';

        try {
            const response = await fetch('http://localhost:3001/api/chamados', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosChamado),
            });

            if (!response.ok) {
                const errorDetails = await response.json();
                console.error("Erro ao salvar chamado:", errorDetails);
                throw new Error(`Falha ao salvar no servidor: ${response.statusText}`);
            }

            const chamadoSalvo = await response.json();
            return chamadoSalvo;

        } catch (error) {
            console.error("Erro ao enviar chamado:", error);
            throw error; // Rejeita a promise com o erro
        } finally {
            btnAbrirChamado.disabled = false;
            btnAbrirChamado.textContent = 'Abrir Chamado';
        }
    }

    // --- Função para excluir um chamado ---
    async function excluirChamado(id) {
        if (confirm(`Tem certeza que deseja excluir o chamado #${id}?`)) {
            try {
                const response = await fetch(`http://localhost:3001/api/chamados/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const errorDetails = await response.json();
                    console.error(`Erro ao excluir chamado #${id}:`, errorDetails);
                    throw new Error(`Falha ao excluir o chamado.`);
                }

                // Remove o chamado da interface
                const chamadoElement = document.getElementById(`chamado-${id}`);
                if (chamadoElement) {
                    chamadoElement.remove();
                }

                mensagemStatus.textContent = `Chamado #${id} excluído com sucesso!`;
                mensagemStatus.className = 'mt-4 text-sm text-green-600';
                setTimeout(() => {
                    mensagemStatus.textContent = '';
                    mensagemStatus.className = 'mt-4 text-sm';
                }, 5000);

            } catch (error) {
                console.error(`Erro ao excluir chamado #${id}:`, error);
                mensagemStatus.textContent = error.message || `Ocorreu um erro ao excluir o chamado #${id}.`;
                mensagemStatus.className = 'mt-4 text-sm text-red-600';
            }
        }
    }

    // --- Função para adicionar o chamado na interface ---
    function adicionarChamadoNaUI(chamado) {
        const novoChamadoDiv = document.createElement('div');
        novoChamadoDiv.className = 'border border-gray-200 p-4 rounded-md bg-gray-50 shadow mb-3 flex items-center justify-between opacity-0 transition-opacity duration-500 ease-out';
        novoChamadoDiv.id = `chamado-${chamado.id}`;

        const detalhesChamado = document.createElement('div');

        let nivelTailwindClasses = 'text-gray-700 font-bold';
        let nivelTexto = chamado.nivel ? chamado.nivel.charAt(0).toUpperCase() + chamado.nivel.slice(1) : 'Não especificado';

        switch (chamado.nivel) {
            case 'alto':
                nivelTailwindClasses = 'text-red-600 font-bold';
                break;
            case 'medio':
                nivelTailwindClasses = 'text-orange-500 font-bold';
                break;
            case 'baixo':
                nivelTailwindClasses = 'text-green-600 font-bold';
                break;
        }

        detalhesChamado.innerHTML = `
            <h3 class="text-lg font-semibold text-gray-700 mb-1">Chamado #${chamado.id}</h3>
            <p class="text-sm text-gray-600 mb-0.5"><strong>Solicitante:</strong> ${chamado.nomeSolicitante || 'Não especificado'}</p>
            <p class="text-sm text-gray-600 mb-0.5"><strong>Serviço:</strong> ${chamado.tipoServico || 'Não especificado'}</p>
            <p class="text-sm text-gray-600 mb-0.5"><strong>Nível:</strong> <span class="${nivelTailwindClasses}">${nivelTexto}</span></p>
            <p class="text-sm text-gray-600 mb-0.5"><strong>Responsável:</strong> ${chamado.responsavel || 'Não especificado'}</p>
            <p class="text-sm text-gray-600 mb-0.5"><strong>Endereço:</strong> ${chamado.endereco || 'Não especificado'}</p>
            <p class="text-sm text-gray-600"><strong>Ocorrido:</strong> ${chamado.descricao || 'Não especificado'}</p>
            <p class="text-xs text-gray-400 mt-2">Aberto em: ${new Date(chamado.dataAbertura).toLocaleString('pt-BR')}</p>
        `;

        const botaoExcluir = document.createElement('button');
        botaoExcluir.textContent = 'Excluir';
        botaoExcluir.className = 'bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm';
        botaoExcluir.addEventListener('click', () => excluirChamado(chamado.id));

        const chamadoDiv = document.createElement('div');
        chamadoDiv.className = 'border border-gray-200 p-4 rounded-md bg-gray-50 shadow mb-3 flex items-center justify-between opacity-0 transition-opacity duration-500 ease-out';
        chamadoDiv.id = `chamado-${chamado.id}`;
        chamadoDiv.appendChild(detalhesChamado);
        chamadoDiv.appendChild(botaoExcluir);

        listaChamados.appendChild(chamadoDiv);
        requestAnimationFrame(() => {
            chamadoDiv.classList.remove('opacity-0');
            chamadoDiv.classList.add('opacity-100');
        });
        chamadoDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    // --- Função para carregar chamados existentes do backend ---
    async function carregarChamadosDoBackend() {
        try {
            const response = await fetch('http://localhost:3001/api/chamados');
            if (!response.ok) {
                throw new Error(`Falha ao carregar chamados: ${response.statusText}`);
            }
            const chamados = await response.json();
            chamados.forEach(chamado => adicionarChamadoNaUI(chamado));
        } catch (error) {
            console.error("Erro ao carregar chamados:", error);
            listaChamados.innerHTML = '<p class="text-red-500">Não foi possível carregar os chamados.</p>';
        }
    }

    // --- Evento de submit do formulário ---
    if (formNovoChamado && listaChamados) {
        formNovoChamado.addEventListener('submit', async function(event) {
            event.preventDefault();

            const dadosChamado = {
                nomeSolicitante: document.getElementById('nomeSolicitante').value,
                tipoServico: document.getElementById('tipoServico').value,
                nivel: document.getElementById('nivelChamado').value,
                responsavel: document.getElementById('nomeResponsavel').value,
                endereco: document.getElementById('enderecoLocal').value,
                descricao: document.getElementById('descricaoOcorrido').value,
            };

            try {
                const chamadoSalvo = await salvarChamadoNoBackend(dadosChamado);
                adicionarChamadoNaUI(chamadoSalvo);
                formNovoChamado.reset();
                mensagemStatus.textContent = `Chamado #${chamadoSalvo.id} aberto com sucesso!`;
                mensagemStatus.className = 'mt-4 text-sm text-green-600';
                setTimeout(() => {
                    if (!mensagemStatus.className.includes('text-red-600')) {
                        mensagemStatus.textContent = '';
                    }
                }, 5000);

            } catch (error) {
                mensagemStatus.textContent = error.message || 'Ocorreu um erro ao abrir o chamado.';
                mensagemStatus.className = 'mt-4 text-sm text-red-600';
                console.error(error);
            } finally {
                btnAbrirChamado.disabled = false;
                btnAbrirChamado.textContent = 'Abrir Chamado';
            }
        });
    } else {
        console.error("Elementos essenciais (formulário, lista de chamados, botão ou status) não encontrados no DOM.");
    }

    // Carregar chamados existentes ao carregar a página
    carregarChamadosDoBackend();
});