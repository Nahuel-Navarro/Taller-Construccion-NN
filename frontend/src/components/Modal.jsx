export default function Modal({ titulo, mensaje, textoConfirmar = 'Confirmar', textoCancelar = 'Cancelar', tipo = 'normal', onConfirmar, onCancelar }) {
  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-titulo">{titulo}</h3>
        <p className="modal-mensaje">{mensaje}</p>
        <div className="modal-acciones">
          <button type="button" className="btn btn-ghost" onClick={onCancelar}>
            {textoCancelar}
          </button>
          <button
            type="button"
            className={`btn ${tipo === 'peligro' ? 'btn-peligro' : 'btn-primary'}`}
            onClick={onConfirmar}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
