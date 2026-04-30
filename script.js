// --- VARIABLES GLOBALES ---
let cohabitantes = JSON.parse(localStorage.getItem('lista_cohabitantes')) || [];
let facturas = JSON.parse(localStorage.getItem('lista_facturas')) || [];
let pagos = JSON.parse(localStorage.getItem('lista_pagos')) || []; // Movida al inicio
let idSeleccionado = null;
let facturaSeleccionadaId = null;
let mesSeleccionadoCobro = "";
let cohabitantePagoId = null;
const CLAVE_CORRECTA = "280897";
const grid = document.getElementById('grid-cohabitantes');
const gridFacturas = document.getElementById('grid-facturas');
const modalFactura = document.getElementById('modal-factura');
const formFactura = document.getElementById('form-factura');
const formCohabitante = document.getElementById('form-cohabitante');
// --- NAVEGACIÓN TIPO INTERRUPTOR ---
function mostrarSeccion(nombre) {
    const sInicio = document.getElementById('seccion-inicio');
    const sLista = document.getElementById('seccion-lista');
    const sFacturas = document.getElementById('seccion-registro-facturas');
    const sPagos = document.getElementById('seccion-pagos');
    // Ocultar todas las secciones de forma segura
    const secciones = [sInicio, sLista, sFacturas, sPagos];
    secciones.forEach(s => {
        if(s) s.style.display = 'none';
    });
    if (nombre === 'lista') {
        sLista.style.display = 'block';
        renderizarTarjetas();
    } else if (nombre === 'inicio') {
        sInicio.style.display = 'block';
    } else if (nombre === 'registro-facturas') {
        sFacturas.style.display = 'block';
        renderizarFacturas();
    } else if (nombre === 'pagos') {
        sPagos.style.display = 'block';
    }
}
// --- SEGURIDAD ---
function solicitarPassword(callback) {
    const modalPass = document.getElementById('modal-password');
    const inputPass = document.getElementById('input-pass');
    modalPass.style.display = 'block';
    inputPass.value = '';
    inputPass.focus();
    document.getElementById('btn-confirmar-pass').onclick = () => {
        if (inputPass.value === CLAVE_CORRECTA) {
            modalPass.style.display = 'none';
            callback();
        } else { alert("Clave incorrecta"); }
    };
    document.getElementById('btn-cancelar-pass').onclick = () => modalPass.style.display = 'none';
    inputPass.onkeydown = (e) => { if(e.key === 'Enter') document.getElementById('btn-confirmar-pass').click(); };
}
// --- FORMATEO ---
document.getElementById('telefono').addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 4) v = v.substring(0, 4) + '-' + v.substring(4, 8);
    e.target.value = v;
});
document.getElementById('dui').addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 8) v = v.substring(0, 8) + '-' + v.substring(8, 9);
    e.target.value = v;
});
// --- GESTIÓN DE COHABITANTES ---
function renderizarTarjetas() {
    grid.innerHTML = '';
    cohabitantes.forEach(c => {
        grid.innerHTML += `
            <div class="card">
                <h4>${c.n1} ${c.n2} ${c.a1} ${c.a2}</h4>
                <p><strong>Tel:</strong> ${c.tel} | <strong>DUI:</strong> ${c.dui}</p>
                <button class="btn-modificar-card" onclick="prepararEdicionCohabitante(${c.id})">Modificar / Eliminar</button>
            </div>`;
    });
}
formCohabitante.onsubmit = (e) => {
    e.preventDefault();
    if(idSeleccionado) return;
    cohabitantes.push({
        id: Date.now(),
        n1: capitalizarTexto(document.getElementById('nombre1').value),
        n2: capitalizarTexto(document.getElementById('nombre2').value),
        a1: capitalizarTexto(document.getElementById('apellido1').value),
        a2: capitalizarTexto(document.getElementById('apellido2').value),
        tel: document.getElementById('telefono').value,
        dui: document.getElementById('dui').value,
        alquiler:parseFloat(document.getElementById('alquiler').value)|| 0,
        servicios: {
            internet: document.getElementById('chk-internet').checked,
            lavadora: document.getElementById('chk-lavadora').checked,
            refrigeradora: document.getElementById('chk-refrigeradora').checked,
            cocina: document.getElementById('chk-cocina').checked
        }
    });
    localStorage.setItem('lista_cohabitantes', JSON.stringify(cohabitantes));
    document.getElementById('modal-formulario').style.display = 'none';
    formCohabitante.reset();
    renderizarTarjetas();
};
document.getElementById('btn-confirmar-cambios').onclick = () => {
    const idx = cohabitantes.findIndex(c => c.id === idSeleccionado);
    const numPersEdit = document.getElementById('num-personas').value || 1;
    cohabitantes[idx] = {
        id: idSeleccionado,
        n1: capitalizarTexto(document.getElementById('nombre1').value),
        n2: capitalizarTexto(document.getElementById('nombre2').value),
        a1: capitalizarTexto(document.getElementById('apellido1').value),
        a2: capitalizarTexto(document.getElementById('apellido2').value),
        tel: document.getElementById('telefono').value,
        dui: document.getElementById('dui').value,
        ocupantes: parseInt(numPersEdit), 
        alquiler: parseFloat(document.getElementById('alquiler').value)|| 0,
        servicios: {
            internet: document.getElementById('chk-internet').checked,
            lavadora: document.getElementById('chk-lavadora').checked,
            refrigeradora: document.getElementById('chk-refrigeradora').checked,
            cocina: document.getElementById('chk-cocina').checked
        }
    };
    localStorage.setItem('lista_cohabitantes', JSON.stringify(cohabitantes));
    document.getElementById('modal-formulario').style.display = 'none';
    renderizarTarjetas();
};
function renderizarFacturas() {
    gridFacturas.innerHTML = '';
    facturas.forEach(f => {
        const color = f.tipo === 'Recibo de Agua' ? '#3498db' : '#f1c40f';
        gridFacturas.innerHTML += `
            <div class="card" style="border-left-color: ${color}">
                <h4>${f.tipo}</h4>
                <p><strong>Mes:</strong> ${f.mes} | <strong>Monto:</strong> $${parseFloat(f.monto).toFixed(2)}</p>
                <button class="btn-modificar-card" onclick="prepararEdicionFactura(${f.id})">Modificar / Eliminar</button>
            </div>`;
    });
}
formFactura.onsubmit = (e) => {
    e.preventDefault();
    if(facturaSeleccionadaId) return;
    facturas.push({
        id: Date.now(),
        tipo: document.getElementById('tipo-servicio').value,
        mes: document.getElementById('mes-factura').value,
        monto: document.getElementById('monto-factura').value
    });
    localStorage.setItem('lista_facturas', JSON.stringify(facturas));
    cerrarModalFactura();
    renderizarFacturas();
};
function abrirModalFactura() {
    facturaSeleccionadaId = null;
    document.getElementById('titulo-modal-factura').innerText = "Registrar Recibo";
    document.getElementById('btns-factura-nuevo').style.display = 'flex';
    document.getElementById('btns-factura-edicion').style.display = 'none';
    modalFactura.style.display = 'block';
}
function cerrarModalFactura() { modalFactura.style.display = 'none'; formFactura.reset(); }
function prepararEdicionFactura(id) {
    solicitarPassword(() => {
        facturaSeleccionadaId = id;
        const f = facturas.find(item => item.id === id);
        if (f) {
            document.getElementById('tipo-servicio').value = f.tipo;
            document.getElementById('mes-factura').value = f.mes;
            document.getElementById('monto-factura').value = f.monto;
            document.getElementById('btns-factura-nuevo').style.display = 'none';
            document.getElementById('btns-factura-edicion').style.display = 'flex';
            document.getElementById('modal-factura').style.display = 'block';
        }
    });
}
document.getElementById('btn-update-factura').onclick = () => {
    const idx = facturas.findIndex(f => f.id === facturaSeleccionadaId);
    if (idx !== -1) {
        facturas[idx] = {
            id: facturaSeleccionadaId,
            tipo: document.getElementById('tipo-servicio').value,
            mes: document.getElementById('mes-factura').value,
            monto: document.getElementById('monto-factura').value
        };
        localStorage.setItem('lista_facturas', JSON.stringify(facturas));
        renderizarFacturas();
        cerrarModalFactura();
    }
};
document.getElementById('btn-delete-factura').onclick = () => {
    if(confirm("¿Eliminar factura?")) {
        facturas = facturas.filter(f => f.id !== facturaSeleccionadaId);
        localStorage.setItem('lista_facturas', JSON.stringify(facturas));
        renderizarFacturas(); cerrarModalFactura();
    }
};
function abrirModalReporte() {
    const select = document.getElementById('select-cohabitante-reporte');
    select.innerHTML = '<option value="">-- Seleccionar --</option>';
    cohabitantes.forEach(c => {
       select.innerHTML += `<option value="${c.id}">${c.n1} ${c.a1}</option>`;
    });
    document.getElementById('modal-reporte').style.display = 'block';
}
function cerrarModalReporte() { document.getElementById('modal-reporte').style.display = 'none'; }
function generarMandamiento() {
    const cohId = document.getElementById('select-cohabitante-reporte').value;
    const mesBusqueda = document.getElementById('mes-reporte').value;
    const inputFecha = document.getElementById('fecha-mandamiento-manual');
    const fechaManual = inputFecha ? inputFecha.value : "";
    if(!cohId) return alert("Por favor, selecciona a un cohabitante");
    const coh = cohabitantes.find(c => c.id == cohId);
    let fechaFinal = fechaManual ? new Date(fechaManual + 'T00:00:00') : new Date();
    const diaDelPago = fechaFinal.getDate();
    const numTotalPersonasCasa = cohabitantes.reduce((sum, c) => sum + (parseInt(c.ocupantes) || 1), 0);
    const ocupantesEsteCuarto = parseInt(coh.ocupantes) || 1;
    const facturaAgua = facturas.find(f => f.tipo === 'Recibo de Agua' && f.mes === mesBusqueda);
    const facturaLuz = facturas.find(f => f.tipo === 'Recibo de Luz' && f.mes === mesBusqueda);
    const montoTotalAgua = facturaAgua ? parseFloat(facturaAgua.monto).toFixed(2) : "0.00";
    const montoTotalLuz = facturaLuz ? parseFloat(facturaLuz.monto).toFixed(2) : "0.00";
    const cuotaAgua = facturaAgua ? (parseFloat(facturaAgua.monto) / numTotalPersonasCasa) * ocupantesEsteCuarto : 0;
    const cuotaLuz = facturaLuz ? (parseFloat(facturaLuz.monto) / numTotalPersonasCasa) * ocupantesEsteCuarto : 0;
    const totalPagadoresInternet = cohabitantes.filter(c => c.servicios && c.servicios.internet).length;
    const cuotaCalculadaInternet = totalPagadoresInternet > 0 ? (25 / totalPagadoresInternet) : 0;
    let cuotaInternet = (coh.servicios && coh.servicios.internet) ? cuotaCalculadaInternet : 0;
    const cuotaLavadora = (coh.servicios && coh.servicios.lavadora) ? 5.00 : 0;
    const cuotaRefri = (coh.servicios && coh.servicios.refrigeradora) ? 2.00 : 0;
    const cuotaCocina = (coh.servicios && coh.servicios.cocina) ? 1.50 : 0;
    const montoOtros = parseFloat(document.getElementById('gasto-manual').value) || 0;
    const notaOtros = document.getElementById('nota-manual').value || "Otros gastos";
    let montoMora = (diaDelPago >= 8) ? 7.50 : 0;
    const montoAlquiler = parseFloat(coh.alquiler)|| 75;
    const totalFinal = montoAlquiler + cuotaAgua + cuotaLuz + cuotaInternet + cuotaLavadora + cuotaRefri + cuotaCocina + montoOtros + montoMora;
    const objetoPago = {
        id: Date.now(),
        cohabitanteId: coh.id,
        mes: mesBusqueda,
        fecha: fechaFinal.toISOString().split('T'),
        monto: totalFinal.toFixed(2)
    };
    // Buscamos si ya existía un pago para este mes para actualizarlo o crearlo
    const indicePago = pagos.findIndex(p => p.cohabitanteId === coh.id && p.mes === mesBusqueda);
    if (indicePago !== -1) {
        pagos[indicePago] = objetoPago;
    } else {
        pagos.push(objetoPago);
    }
    localStorage.setItem('lista_pagos', JSON.stringify(pagos));
    // 4. Generación del HTML para Impresión
    const contenidoHTML = `
        <div class="ticket">
            <div class="header">
                <h3>URBANIZACIÓN LA CORUÑA II</h3>
                <p>MANDAMIENTO DE PAGO - ${mesBusqueda.toUpperCase()} 2026</p>
            </div>
            <p><strong>Representante:</strong> ${coh.n1} ${coh.a1}</p>
            <p><strong>Ocupantes en cuarto:</strong> ${ocupantesEsteCuarto} persona(s)</p>
            <p><strong>DUI:</strong> ${coh.dui} | <strong>Fecha:</strong> ${fechaFinal.toLocaleDateString()}</p>
            <table>
                <tr><td>Alquiler Habitual</td><td>$${montoAlquiler.toFixed(2)}</td></tr>
                <tr><td>Luz (Total $${montoTotalLuz})</td><td>$${cuotaLuz.toFixed(2)}</td></tr>
                <tr><td>Agua (Total $${montoTotalAgua})</td><td>$${cuotaAgua.toFixed(2)}</td></tr>
                ${cuotaInternet > 0 ? `<tr><td>Internet (Servicio Compartido)</td><td>$${cuotaInternet.toFixed(2)}</td></tr>` : ''}
                ${cuotaLavadora > 0 ? `<tr><td>Uso de Lavadora</td><td>$5.00</td></tr>` : ''}
                ${cuotaRefri > 0 ? `<tr><td>Uso de Refrigeradora</td><td>$2.00</td></tr>` : ''}
                ${cuotaCocina > 0 ? `<tr><td>Uso de Cocina y Gas</td><td>$1.52</td></tr>` : ''}
                ${montoMora > 0 ? `<tr><td>Mora Pago Tardío (Día ${diaDelPago})</td><td>$${montoMora.toFixed(2)}</td></tr>` : ""}
                ${montoOtros > 0 ? `<tr><td>${notaOtros}</td><td>$${montoOtros.toFixed(2)}</td></tr>` : ''}
                <tr class="total"><td>TOTAL A PAGAR</td><td>$${totalFinal.toFixed(2)}</td></tr>
            </table>
            <p style="font-size: 0.8em; text-align: center; margin-top: 10px;">
                Cálculo basado en ${numTotalPersonasCasa} habitantes totales en la propiedad.
            </p>
            <div class="firma-espacio"><p>__________________________</p><p>F. Administrador</p></div>
        </div>`;
    const ventana = window.open('', '_blank');
    ventana.document.write(`<html><head><style>
        @page { size: landscape; margin: 10mm; }
        body { font-family: Arial, sans-serif; display: flex; justify-content: space-around; padding: 20px; }
        .ticket { width: 45%; border: 1px dashed #000; padding: 20px; box-sizing: border-box; }
        .header { text-align: center; border-bottom: 2px solid #000; margin-bottom: 10px; }
        table { width: 100%; margin-top: 10px; border-collapse: collapse; }
        td { padding: 5px 0; border-bottom: 1px solid #eee; }
        .total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #000; padding-top: 10px; }
        .firma-espacio { margin-top: 60px; text-align: center; }
    </style></head><body>${contenidoHTML} ${contenidoHTML}</body></html>`);
    ventana.document.close();
    setTimeout(() => {
        ventana.print();
        document.getElementById('modal-reporte').style.display = 'none';
        // Esto refresca la lista de pagos para que cambie de rojo a verde de inmediat
        mostrarSeccion('seccion-pagos');
    }, 500);
}
// --- CONTROL DE PAGOS Y MORAS ---
function administrarPagos() {
    mostrarSeccion('pagos');
    const contenedorMeses = document.getElementById('lista-meses-pago');
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    contenedorMeses.innerHTML = '';
    meses.forEach(m => {
        contenedorMeses.innerHTML += `<button onclick="verPagosMes('${m}')" id="btn-mes-${m}" class="btn-mes-lateral">${m}</button>`;
    });
}
function verPagosMes(mes) {
    mesSeleccionadoCobro = mes;
    document.getElementById('titulo-mes-seleccionado').innerText = `Estado de Pagos: ${mes} 2026`;
    const contenedor = document.getElementById('contenedor-estado-pagos');
    contenedor.innerHTML = '';
    cohabitantes.forEach(c => {
        const pagoRealizado = pagos.find(p => p.cohabitanteId === c.id && p.mes === mes);
        const div = document.createElement('div');
        div.className = 'card';
        div.style.borderLeft = pagoRealizado ? '5px solid #27ae60' : '5px solid #e74c3c';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        if (pagoRealizado) {
            div.innerHTML = `
                <div>
                    <span style="color:#27ae60; font-weight:bold;">✔ AL DÍA</span><br>
                    <strong>${c.n1} ${c.a1}</strong><br>
                    <small>Fecha cobro: ${pagoRealizado.fecha}</small>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:bold; font-size:18px;">$${pagoRealizado.monto}</div>
                    <button onclick="eliminarPago(${pagoRealizado.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer; text-decoration:underline; font-size:12px;">Eliminar Pago</button>
                </div>`;
        } else {
            div.innerHTML = `
                <div>
                    <span style="color:#e74c3c; font-weight:bold;">✘ PENDIENTE</span><br>
                    <strong>${c.n1} ${c.a1}</strong>
                </div>
                <button class="btn-guardar" onclick="abrirModalRegistrarPago(${c.id})">Registrar Pago</button>`;
        }
        contenedor.appendChild(div);
    });
}
function eliminarPago(pagoId) {
    solicitarPassword(() => {
        if(confirm("¿Estás seguro de eliminar este registro de pago?")) {
            pagos = pagos.filter(p => p.id !== pagoId);
            localStorage.setItem('lista_pagos', JSON.stringify(pagos));
            verPagosMes(mesSeleccionadoCobro);
        }
    });
}
function abrirModalRegistrarPago(id) {
    cohabitantePagoId = id;
    const c = cohabitantes.find(coh => coh.id === id);
    document.getElementById('info-pago-cohabitante').innerText = `Registrando pago para: ${c.n1} ${c.a1}`;
    document.getElementById('fecha-pago-real').value = new Date().toISOString().split('T');
    document.getElementById('modal-registrar-pago').style.display = 'block';
}
function guardarPagoFinal() {
    const fecha = document.getElementById('fecha-pago-real').value;
    const monto = parseFloat(document.getElementById('monto-pago-recibido').value) || 0;
    const diaPago = new Date(fecha).getUTCDate();
    let montoFinal = monto;
    if (diaPago > 7) {
        if (confirm("El pago es después del día 7. ¿Aplicar $5.00 de mora?")) {
            montoFinal += 5.00;
        }
    }
    pagos.push({
        cohabitanteId: cohabitantePagoId,
        mes: mesSeleccionadoCobro,
        fecha: fecha,
        monto: montoFinal.toFixed(2)
    });
    localStorage.setItem('lista_pagos', JSON.stringify(pagos));
    cerrarModalPago();
    verPagosMes(mesSeleccionadoCobro);
}
function cerrarModalPago() { document.getElementById('modal-registrar-pago').style.display = 'none'; }
// --- CONFIGURACIÓN DE TECLA ENTER ---
function configurarEnter(idFormulario) {
    const inputs = Array.from(document.querySelectorAll(`#${idFormulario} input, #${idFormulario} select`));
    inputs.forEach((input, index) => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const next = inputs[index + 1];
                if (next) next.focus();
                else {
                    const formulario = document.getElementById(idFormulario);
                    if (idFormulario === 'form-cohabitante' && idSeleccionado) document.getElementById('btn-confirmar-cambios').click();
                    else if (idFormulario === 'form-factura' && facturaSeleccionadaId) document.getElementById('btn-update-factura').click();
                    else formulario.requestSubmit();
                }
            }
        });
    });
}
configurarEnter('form-cohabitante');
configurarEnter('form-factura');
// --- EVENTOS INICIALES ---
document.getElementById('btn-abrir-modal').onclick = () => {
    idSeleccionado = null;
    formCohabitante.reset();
    document.getElementById('contenedor-botones-nuevo').style.display = 'flex';
    document.getElementById('contenedor-botones-edicion').style.display = 'none';
    document.getElementById('modal-formulario').style.display = 'block';
};
document.getElementById('btn-cerrar-modal').onclick = () => {
    idSeleccionado = null;
    document.getElementById('modal-formulario').style.display = 'none';
};
document.getElementById('btn-regresar-opciones').onclick = () => {
    idSeleccionado = null;

    document.getElementById('modal-formulario').style.display = 'none';
};
// Lógica para eliminar cohabitante
document.getElementById('btn-eliminar-cohabitante').onclick = () => {
    if (confirm("¿Estás seguro de eliminar a este cohabitante? Esta acción no se puede deshacer.")) {
        cohabitantes = cohabitantes.filter(c => c.id !== idSeleccionado);
        localStorage.setItem('lista_cohabitantes', JSON.stringify(cohabitantes));
        document.getElementById('modal-formulario').style.display = 'none';
        renderizarTarjetas();
        alert("Registro eliminado con éxito.");
    }
};
// ASEGÚRATE DE QUE ESTA FUNCIÓN ESTÉ AL FINAL DE TU ARCHIVO
function capitalizarTexto(texto) {
    if (!texto || typeof texto !== 'string') return "";
    let limpio = texto.trim();
    if (limpio.length === 0) return "";
    // Toma la primera, la hace mayúscula, y el resto minúscula
    return limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase();
}
function prepararEdicionCohabitante(id) {
    solicitarPassword(() => {
        idSeleccionado = id;
        const c = cohabitantes.find(item => item.id === id);
        document.getElementById('nombre1').value = c.n1;
        document.getElementById('nombre2').value = c.n2 || '';
        document.getElementById('apellido1').value = c.a1;
        document.getElementById('apellido2').value = c.a2 || '';
        document.getElementById('telefono').value = c.tel;
        document.getElementById('dui').value = c.dui;
        document.getElementById('num-personas').value = c.ocupantes || 1;
        document.getElementById('alquiler').value=c.alquiler||0; 
            if(c.servicios) {
            document.getElementById('chk-internet').checked = c.servicios.internet;
            document.getElementById('chk-lavadora').checked = c.servicios.lavadora;
            document.getElementById('chk-refrigeradora').checked = c.servicios.refrigeradora;
            document.getElementById('chk-cocina').checked = c.servicios.cocina;
        }
        document.getElementById('contenedor-botones-nuevo').style.display = 'none';
        document.getElementById('contenedor-botones-edicion').style.display = 'flex';
        document.getElementById('modal-formulario').style.display = 'block';
    });
}