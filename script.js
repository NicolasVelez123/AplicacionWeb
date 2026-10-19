/* ==========================================================
   NixFix — script.js
   Dos interacciones, sin librerías externas:
   1) Menú adaptable (móvil)
   2) Validación accesible del formulario de contacto
   ========================================================== */

/* ---------- 1. MENÚ ADAPTABLE ---------- */

const botonMenu = document.querySelector('.menu-toggle');
const menu = document.querySelector('#menu-principal');
const consultaTablet = window.matchMedia('(min-width: 40em)');

// Abre o cierra el menú y mantiene aria-expanded sincronizado
function establecerMenu(abierto) {
  menu.classList.toggle('is-open', abierto);
  botonMenu.setAttribute('aria-expanded', String(abierto));
}

function menuEstaAbierto() {
  return menu.classList.contains('is-open');
}

if (botonMenu && menu) {
  // Clic en el botón: alterna el estado
  botonMenu.addEventListener('click', () => {
    establecerMenu(!menuEstaAbierto());
  });

  // Clic en un enlace: cierra el menú para ver la sección elegida
  menu.addEventListener('click', (evento) => {
    if (evento.target.closest('a')) {
      establecerMenu(false);
    }
  });

  // Tecla Escape: cierra el menú y devuelve el foco al botón
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && menuEstaAbierto()) {
      establecerMenu(false);
      botonMenu.focus();
    }
  });

  // Al pasar a pantalla ancha, se restablece el estado del menú
  consultaTablet.addEventListener('change', () => {
    establecerMenu(false);
  });
}

/* ---------- 2. VALIDACIÓN ACCESIBLE DEL FORMULARIO ---------- */

const formulario = document.querySelector('#contacto form');
const estado = document.querySelector('#form-status');

// Cada validador recibe el valor y devuelve un mensaje ('' si es válido).
// Las claves coinciden con el id de cada campo.
const validadores = {
  nombre(valor) {
    if (valor.trim().length < 3) {
      return 'Escribe tu nombre completo (mínimo 3 caracteres).';
    }
    return '';
  },

  correo(valor) {
    const correo = valor.trim();
    if (correo === '') {
      return 'Escribe tu correo electrónico.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return 'Escribe un correo válido, por ejemplo nombre@dominio.com.';
    }
    return '';
  },

  equipo(valor) {
    if (valor === '') {
      return 'Selecciona el tipo de equipo.';
    }
    return '';
  },

  problema(valor) {
    if (valor.trim().length < 10) {
      return 'Describe el problema con al menos 10 caracteres.';
    }
    return '';
  },
};

// Muestra el error: texto visible + estado para tecnologías de apoyo
function mostrarError(campo, mensaje) {
  const caja = document.getElementById(`${campo.id}-error`);
  caja.textContent = mensaje;
  caja.hidden = false;
  campo.setAttribute('aria-invalid', 'true');
  campo.setAttribute('aria-describedby', caja.id);
}

function limpiarError(campo) {
  const caja = document.getElementById(`${campo.id}-error`);
  caja.textContent = '';
  caja.hidden = true;
  campo.removeAttribute('aria-invalid');
  campo.removeAttribute('aria-describedby');
}

// Valida un campo; devuelve true si es válido
function validarCampo(campo) {
  const mensaje = validadores[campo.id](campo.value);
  if (mensaje) {
    mostrarError(campo, mensaje);
    return false;
  }
  limpiarError(campo);
  return true;
}

function mostrarEstado(texto, tipo) {
  estado.textContent = texto;
  estado.dataset.tipo = tipo;
}

if (formulario && estado) {
  // Al enviar: valida todo, enfoca el primer error o confirma el envío
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const campos = [...formulario.querySelectorAll('input, select, textarea')];
    const invalidos = campos.filter((campo) => !validarCampo(campo));

    if (invalidos.length > 0) {
      const cantidad = invalidos.length;
      mostrarEstado(
        `Hay ${cantidad} ${cantidad === 1 ? 'campo' : 'campos'} por corregir.`,
        'error'
      );
      invalidos[0].focus();
      return;
    }

    const nombre = formulario.elements.nombre.value.trim();
    mostrarEstado(
      `¡Gracias, ${nombre}! Recibimos tu solicitud y te responderemos pronto.`,
      'exito'
    );
    formulario.reset();
  });

  // Mientras escribe: si el campo estaba marcado con error, se revalida al instante
  formulario.addEventListener('input', (evento) => {
    const campo = evento.target;
    if (campo.hasAttribute('aria-invalid')) {
      validarCampo(campo);
    }
  });
}