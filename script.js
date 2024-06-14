//Elementos dos Filtros
var clientesElem;
var projetosElem;
var tipoElem;

//Elementos Visuais
var linhaTempoElem

//Listas Filtradas
var projetosFiltrados = [];
var tiposFiltrados = [];
var ticketsFiltrados = [];

$(() => {
    criaComboClientes();
    criaComboProjetos();
    criaComboTipo();
});

function criaComboClientes() {
    $("#comboCliente").dxTagBox({
        dataSource: clientes,
        displayExpr: "Nome",
        valueExpr: "Nome",
        placeholder: "Selecione o Cliente",
        searchEnabled: true,
        showSelectionControls: true,
        selectAllText: "Selecionar Todos",
        width: "100%",
        onSelectionChanged: function () {
            if (projetosElem == null) {
                return;
            }

            let clientesSelecionados = $("#comboCliente").dxTagBox('option', "selectedItems");
            let NomeDosClientesSelecionados = clientesSelecionados.map(function (cliente) {
                return cliente.Nome;
            })

            projetosFiltrados = projetos.filter(function (proj) {
                return NomeDosClientesSelecionados.includes(proj.Cliente);
            });

            projetosElem.option({ dataSource: projetosFiltrados });
        }
    });

    clientesElem = $("#comboCliente").dxTagBox("instance");
}

function criaComboProjetos() {
    $("#comboProjeto").dxTagBox({
        dataSource: projetosFiltrados,
        displayExpr: "Nome",
        valueExpr: "Nome",
        placeholder: "Selecione o Projeto",
        searchEnabled: true,
        showSelectionControls: true,
        selectAllText: "Selecionar Todos",
        width: "100%",
        onSelectionChanged: function () {

            let projetosSelecionados = $("#comboProjeto").dxTagBox('option', "selectedItems");
            projetosFiltrados = projetosSelecionados.map(function (projeto) {
                return projeto.Nome;
            });

            filtraTickets();
        }
    });

    projetosElem = $("#comboProjeto").dxTagBox("instance");
}

function criaComboTipo() {
    $("#comboTipo").dxTagBox({
        dataSource: tipos,
        displayExpr: "NomeTipoTicket",
        valueExpr: "NomeTipoTicket",
        placeholder: "Selecione o Tipo de Demanda",
        searchEnabled: true,
        showSelectionControls: true,
        selectAllText: "Selecionar Todos",
        width: "100%",
        onSelectionChanged: function () {

            let tiposSelecionados = $("#comboTipo").dxTagBox('option', "selectedItems");
            tiposFiltrados = tiposSelecionados.map(function (tipo) {
                return tipo.NomeTipoTicket;
            });

            filtraTickets();
        }
    });

    tipoElem = $("#comboTipo").dxTagBox("instance");
}

//Precisa Implementar
function criaLinhaTempo() {
    $("#chartTickets").dxChart({
        dataSource: tipos,
        displayExpr: "NomeTipoTicket",
        valueExpr: "NomeTipoTicket",
        placeholder: "Selecione o Tipo de Demanda",
        searchEnabled: true,
        showSelectionControls: true,
        selectAllText: "Selecionar Todos",
        width: "100%"
    });

    tipoElem = $("#comboTipo").dxTagBox("instance");
}

function filtraTickets() {

    ticketsFiltrados = tickets.filter(function (ticket) {
        if (projetosFiltrados.includes(ticket.NomeProjeto)
            && tiposFiltrados.includes(ticket.NomeTipoTicket))
            return ticket;
    });

    atualizaDadosLinhaTempo();
}

function atualizaDadosLinhaTempo() {
    const ticketCounts = {};

    ticketsFiltrados.forEach(ticket => {
        const date = new Date(ticket.DataCadastro);
        const month = date.getMonth() + 1; // Months are 0-based, so add 1
        const year = date.getFullYear();
        const key = `${year}-${month.toString().padStart(2, "0")}`;

        if (!ticketCounts[key]) {
            ticketCounts[key] = {};
        }

        if (!ticketCounts[key][ticket.NomeTipoTicket]) {
            ticketCounts[key][ticket.NomeTipoTicket] = 0;
        }

        ticketCounts[key][ticket.NomeTipoTicket]++;
    });

    const chartData = [];

    for (const [date, types] of Object.entries(ticketCounts)) {
        const dataPoint = { date };
        for (const [type, count] of Object.entries(types)) {
            dataPoint[type] = count;
        }
        chartData.push(dataPoint);
    }


    const series = tiposFiltrados.map(name => ({
        valueField: name,
        name: name
    }));

    $("#chartTickets").dxChart({
        dataSource: chartData,
        commonSeriesSettings: {
            argumentField: "date",
            type: "line"
        },
        series: series,
        legend: {
            verticalAlignment: "right",
            horizontalAlignment: "center"
        },
        argumentAxis: {
            label: {
                format: "monthAndYear"
            },
            argumentType: "datetime",

        },
        valueAxis: {
            title: {
                text: "Qtd. de Tickets"
            }
        },
        tooltip: {
            enabled: true
        },
        width: '100%'
    });
}


