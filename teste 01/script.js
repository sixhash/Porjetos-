document.addEventListener('DOMContentLoaded', function() {
    const botaoAbrir = document.querySelector('.abrir');
    const botaoFechar = document.querySelector('.fechar');
    const statusDiv = document.getElementById('status');

    let socket;
    let lixeiraAberta = false;
    let tentandoReconectar = false;

    function conectarESP32() {
        // Substitua pelo IP local do seu ESP32
        const esp32IP = '192.168.1.100'; 
        socket = new WebSocket(`ws://${esp32IP}:81`);
        
        socket.onopen = function() {
            tentandoReconectar = false;
            statusDiv.textContent = 'Conectado ao ESP32';
            statusDiv.className = 'status connected';
            console.log('Conectado ao ESP32');
        };
        
        socket.onclose = function() {
            statusDiv.textContent = 'Desconectado do ESP32';
            statusDiv.className = 'status disconnected';
            console.log('Desconectado do ESP32');
            
            if (!tentandoReconectar) {
                tentandoReconectar = true;
                setTimeout(conectarESP32, 5000); // Tenta reconectar após 5 segundos
            }
        };
        
        socket.onerror = function(error) {
            console.error('Erro na conexão:', error);
            statusDiv.textContent = 'Erro na conexão com ESP32';
            statusDiv.className = 'status disconnected';
            
            if (!tentandoReconectar) {
                tentandoReconectar = true;
                setTimeout(conectarESP32, 5000); // Tenta reconectar após 5 segundos
            }
        };
        
        socket.onmessage = function(event) {
            console.log('Mensagem recebida:', event.data);
            if (event.data === 'aberto') {
                lixeiraAberta = true;
                atualizarStatus('Lixeira aberta com sucesso!');
            } else if (event.data === 'fechado') {
                lixeiraAberta = false;
                atualizarStatus('Lixeira fechada com sucesso!');
            }
        };
    }

    function atualizarStatus(mensagem) {
        // Cria um elemento de notificação mais amigável que alert()
        const notificacao = document.createElement('div');
        notificacao.className = 'notificacao';
        notificacao.textContent = mensagem;
        document.body.appendChild(notificacao);
        
        setTimeout(() => {
            notificacao.remove();
        }, 3000);
    }

    function abrirLixeira() {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send('abrir');
            console.log('Comando enviado: abrir');
            botaoAbrir.classList.add('enviando');
            setTimeout(() => {
                botaoAbrir.classList.remove('enviando');
            }, 1000);
        } else {
            atualizarStatus('Não conectado ao ESP32!');
            conectarESP32(); // Tenta reconectar
        }
    }

    function fecharLixeira() {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send('fechar');
            console.log('Comando enviado: fechar');
            botaoFechar.classList.add('enviando');
            setTimeout(() => {
                botaoFechar.classList.remove('enviando');
            }, 1000);
        } else {
            atualizarStatus('Não conectado ao ESP32!');
            conectarESP32(); // Tenta reconectar
        }
    }

    // Iniciar conexão quando a página carregar
    conectarESP32();

    botaoAbrir.addEventListener('click', abrirLixeira);
    botaoFechar.addEventListener('click', fecharLixeira);
});