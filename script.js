var clientesElem;
var projetosElem;
var tipoElem;


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

            projetosElem.option({
                dataSource: projetos.filter(function (proj) {
                    return NomeDosClientesSelecionados.includes(proj.Cliente);
                }),
            });
        }
    });

    clientesElem = $("#comboCliente").dxTagBox("instance");
}


function criaComboProjetos() {
    $("#comboProjeto").dxTagBox({
        dataSource: projetos,
        displayExpr: "Nome",
        valueExpr: "Nome",
        placeholder: "Selecione o Projeto",
        searchEnabled: true,
        showSelectionControls: true,
        selectAllText: "Selecionar Todos",
        width: "100%"

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
        width: "100%"

    });

    tipoElem = $("#comboTipo").dxTagBox("instance");
}





