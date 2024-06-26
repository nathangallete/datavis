﻿//Elementos dos Filtros
var clientesElem;
var projetosElem;
var tipoElem;

//Elementos Visuais
var linhaTempoElem
var linhaTempo2Elem

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

    const chartData1 = [];

    for (const [date, types] of Object.entries(ticketCounts)) {
        const dataPoint = { date };
        for (const [type, count] of Object.entries(types)) {
            dataPoint[type] = count;
        }
        chartData1.push(dataPoint);
    }


    const series1 = tiposFiltrados.map(name => ({
        valueField: name,
        name: name
    }));


    ticketsFiltrados.forEach(ticket => {
        const date = new Date(ticket.DataCadastro);
        const month = date.getMonth() + 1; // Months are 0-based, so add 1
        const year = date.getFullYear();
        const key = `${year}-${month.toString().padStart(2, "0")}`;

        if (!ticketCounts[key]) {
            ticketCounts[key] = {};
        }

        if (!ticketCounts[key][ticket.NomeProjeto]) {
            ticketCounts[key][ticket.NomeProjeto] = 0;
        }

        ticketCounts[key][ticket.NomeProjeto]++;
    });

    const chartData2 = [];

    for (const [date, types] of Object.entries(ticketCounts)) {
        const dataPoint = { date };
        for (const [type, count] of Object.entries(types)) {
            dataPoint[type] = count;
        }
        chartData2.push(dataPoint);
    }


    const series2 = projetosFiltrados.map(name => ({
        valueField: name,
        name: name
    }));

    criaLinhaTempo1(chartData1, series1);
    criaLinhaTempo2(chartData2, series2);

    const monthlyHours = {};

    ticketsFiltrados.forEach(ticket => {
        const date = new Date(ticket.DataCadastro);
        const month = date.getMonth() + 1; // Months are 0-based, so add 1
        const year = date.getFullYear();
        const key = `${year}-${month.toString().padStart(2, '0')}`;

        if (!monthlyHours[key]) {
            monthlyHours[key] = {
                HorasPrevistas: 0,
                HorasRealizadas: 0
            };
        }

        monthlyHours[key].HorasPrevistas += ticket.HorasPrevistas;
        monthlyHours[key].HorasRealizadas += ticket.HorasRealizadas;
    });

    const chartData3 = [];

    for (const [date, hours] of Object.entries(monthlyHours)) {
        chartData3.push({
            date: date,
            HorasPrevistas: hours.HorasPrevistas,
            HorasRealizadas: hours.HorasRealizadas
        });
    }

    criaComparacaoHoras(chartData3);

    const ticketCounts2 = {};


    if (ticketsFiltrados.length == 0)
        return;

    ticketsFiltrados.forEach(ticket => {
        const type = ticket.NomeTipoTicket;
        const status = ticket.NomeStatusTicket;

        if (!ticketCounts2[type]) {
            ticketCounts2[type] = { total: 0, concluido: 0 };
        }

        ticketCounts2[type].total++;
        if (status === "Concluído" || status === "Cancelado" || status === "Em teste na Homologação") {
            ticketCounts2[type].concluido++;
        }
    });

    // Calcular a proporção de tickets concluídos
    const barGaugeData = [];

    for (const [type, counts] of Object.entries(ticketCounts2)) {
        barGaugeData.push({
            type: type,
            value: (counts.concluido / counts.total * 100)
        });
    }

    criaMedidorConcluidos(barGaugeData);
}

function criaLinhaTempo1(chartData, series) {
    $("#chartTickets").dxChart({
        dataSource: chartData,
        title: {
            text: "Tickets x Tipo de Demanda",
        },
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

function criaLinhaTempo2(chartData, series) {
    $("#chartTickets2").dxChart({
        dataSource: chartData,
        title: {
            text: "Tickets x Projeto",
        },
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

function criaComparacaoHoras(chartData) {
    $("#chartHoras").dxChart({
        dataSource: chartData,
        title: {
            text: "Horas Previstas x Realizadas",
        },
        commonSeriesSettings: {
            argumentField: "date",
            type: "bar"
        },
        series: [
            { valueField: "HorasPrevistas", name: "Horas Previstas" },
            { valueField: "HorasRealizadas", name: "Horas Realizadas" }
        ],
        legend: {
            verticalAlignment: "bottom",
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
                text: "Horas"
            }
        },
        tooltip: {
            enabled: true
        },
        width: '100%'
    });
}

function criaMedidorConcluidos(barGaugeData) {
    $("#medidor").dxBarGauge({
        startValue: 0,
        endValue: 100,
        values: barGaugeData.map(item => item.value),
        title: {
            text: "Tickets Concluídos por Tipo de Ticket (%)",
            font: {
                size: 28
            }
        },
        customizeText(arg) {
            return `${arg.valueText} %`;
        },
        tooltip: {
            enabled: true,
            customizeTooltip(arg) {
                const type = barGaugeData[arg.index].type;
                const value = barGaugeData[arg.index].value;
                return {
                    text: `${type}: ${value.toFixed(2)}%`
                };
            }
        },
        legend: {
            visible: true,
            verticalAlignment: 'bottom',
            horizontalAlignment: 'center',
            customizeText(arg) {
                const type = barGaugeData[arg.item.index].type;
                return (type);
            },
        },
        palette: 'ocean',

        width: '100%'
    });
}


