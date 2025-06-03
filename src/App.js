import React, { useState, useEffect } from 'react';

const archivosDisponibles = [
  'Examen_20A.json',
  'Examen_20B.json',
  'Examen_23A.json',
  'Examen_23B.json',
  'Examen_24A.json',
  'Examen_24B.json'
];

function App() {
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [preguntasTotales, setPreguntasTotales] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [cantidad, setCantidad] = useState(null);
  const [indice, setIndice] = useState(0);
  const [seleccionada, setSeleccionada] = useState(null);
  const [mostrarRespuesta, setMostrarRespuesta] = useState(false);
  const [modoContinuar, setModoContinuar] = useState(false);
  const [preguntasNoVistas, setPreguntasNoVistas] = useState([]);
  const [aciertos, setAciertos] = useState(0);
  const [falladas, setFalladas] = useState([]);
  const [preguntasVistas, setPreguntasVistas] = useState(new Set());
  const [mensajeCopiado, setMensajeCopiado] = useState('');

  useEffect(() => {
    if (archivoSeleccionado) {
      fetch(`/${archivoSeleccionado}`)
        .then((res) => res.json())
        .then((data) => {
          setPreguntasTotales(data);
        });
    }
  }, [archivoSeleccionado]);

  const copiarPreguntaAlPortapapeles = () => {
    const texto = `${pregunta.enunciado}\n\n` + 
      Object.entries(pregunta.opciones)
        .map(([letra, texto]) => `${letra}. ${texto}`)
        .join('\n');
    navigator.clipboard.writeText(texto)
      .then(() => {
        setMensajeCopiado('✔ Pregunta copiada');
        setTimeout(() => setMensajeCopiado(''), 2000); // mensaje desaparece en 2s
      })
      .catch(() => {
        setMensajeCopiado('⚠ Error al copiar');
        setTimeout(() => setMensajeCopiado(''), 2000);
      });
  };  

  const appStyle = {
    backgroundColor: '#121212',
    color: '#e0e0e0',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const botonStyle = {
    margin: '5px',
    padding: '10px 15px',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px'
  };

  const handleSeleccion = (letra) => {
    setSeleccionada(letra);
    setMostrarRespuesta(true);
    setPreguntasVistas((prev) => new Set(prev).add(preguntas[indice].numero));

    const correcta = preguntas[indice].respuesta;
    if (letra === correcta) {
      setAciertos((prev) => prev + 1);
    } else {
      setFalladas((prev) => [...prev, preguntas[indice]]);
    }
  };

  const siguientePregunta = () => {
    setIndice((prev) => prev + 1);
    setSeleccionada(null);
    setMostrarRespuesta(false);
  };

  const comenzarSesion = (cantidadSeleccionada) => {
    setCantidad(cantidadSeleccionada);
    const barajadas = [...preguntasTotales].sort(() => Math.random() - 0.5);
    setPreguntas(barajadas.slice(0, cantidadSeleccionada));
    setIndice(0);
    setSeleccionada(null);
    setMostrarRespuesta(false);
    setAciertos(0);
    setFalladas([]);
  };

  const volverAlInicio = () => {
    setPreguntasVistas(new Set());
    setArchivoSeleccionado(null);
    setCantidad(null);
    setPreguntas([]);
    setPreguntasTotales([]);
    setIndice(0);
    setAciertos(0);
    setFalladas([]);
  };

  // ETAPA 1: Elegir examen
  if (!archivoSeleccionado) {
    return (
      <div style={appStyle}>
        <h1>Práctica CONAREME</h1>
        <p>Selecciona un examen:</p>
        {archivosDisponibles.map((archivo) => (
          <button
            key={archivo}
            style={botonStyle}
            onClick={() => setArchivoSeleccionado(archivo)}
          >
            {archivo.replace('.json', '')}
          </button>
        ))}
      </div>
    );
  }

  // ETAPA 2: Elegir cuántas preguntas practicar
  if (!cantidad) {
    // Saber cuántas preguntas hay para elegir
    const preguntasDisponibles = modoContinuar ? preguntasNoVistas.length : preguntasTotales.length;
    const preguntasTexto = modoContinuar ? "preguntas nuevas disponibles" : "preguntas en total";

    // Función para empezar la sesión según la cantidad elegida
    const comenzarSesionModificado = (cantidadSeleccionada) => {
      const fuente = modoContinuar ? preguntasNoVistas : preguntasTotales;

      // Mezclar las preguntas y tomar solo la cantidad que elegiste
      const barajadas = [...fuente].sort(() => Math.random() - 0.5);

      setPreguntas(barajadas.slice(0, cantidadSeleccionada));
      setCantidad(cantidadSeleccionada);
      setIndice(0);
      setSeleccionada(null);
      setMostrarRespuesta(false);
      setAciertos(0);
      setFalladas([]);

      // Salir del modo continuar para volver a lo normal
      if (modoContinuar) {
        setModoContinuar(false);
        setPreguntasNoVistas([]);
      }
    };

    return (
      <div style={appStyle}>
        <h1>{archivoSeleccionado.replace('.json', '')}</h1>
        <p>
          {preguntasDisponibles} {preguntasTexto}
        </p>
        <p>¿Cuántas preguntas quieres resolver?</p>
        {[5, 10, 20, 30].map((num) => (
          <button
            key={num}
            style={botonStyle}
            onClick={() => {
              if (num > preguntasDisponibles) {
                alert(`Solo hay ${preguntasDisponibles} preguntas disponibles.`);
                return;
              }
              comenzarSesionModificado(num);
            }}
          >
            {num}
          </button>
        ))}
        <div style={{ marginTop: '20px' }}>
          <button onClick={volverAlInicio} style={botonStyle}>
            ⬅️ Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // ETAPA 3: Fin de sesión
  if (indice >= preguntas.length) {
    const reintentarFalladas = () => {
      setPreguntas(falladas);
      setIndice(0);
      setCantidad(falladas.length);
      setAciertos(0);
      setFalladas([]);
      setSeleccionada(null);
      setMostrarRespuesta(false);
    };

    const continuarNoVistas = () => {
      const noVistas = preguntasTotales.filter(p => !preguntasVistas.has(p.numero));
    
      if (noVistas.length === 0) {
        alert('No quedan preguntas nuevas para continuar.');
        return;
      }
    
      setPreguntasNoVistas(noVistas);
      setModoContinuar(true);
      setCantidad(null);
      setIndice(0);
      setSeleccionada(null);
      setMostrarRespuesta(false);
    };

    return (
      <div style={appStyle}>
        <h1>{archivoSeleccionado.replace('.json', '')}</h1>
        <h2>¡Terminaste la sesión!</h2>
        <p>Aciertos: {aciertos} / {preguntas.length}</p>
        <button onClick={reintentarFalladas} style={botonStyle}>
          Reintentar preguntas falladas
        </button>
        <button onClick={continuarNoVistas} style={botonStyle}>
          Continuar con preguntas nuevas
        </button>
        <button onClick={volverAlInicio} style={botonStyle}>
          Volver al inicio
        </button>
      </div>
    );
  }
  
  if (!preguntas[indice]) {
    return (
      <div style={appStyle}>
        <h2>No hay preguntas para mostrar</h2>
        <button onClick={volverAlInicio} style={botonStyle}>
          Volver al inicio
        </button>
      </div>
    );
  }
  
  // ETAPA 4: Mostrando preguntas
  const pregunta = preguntas[indice];

  return (
    <div style={appStyle}>
      <h1>{archivoSeleccionado.replace('.json', '')}</h1>
      <h2>
        Pregunta {indice + 1} de {preguntas.length}
      </h2>
      <p>{pregunta.enunciado}</p>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {Object.entries(pregunta.opciones).map(([letra, texto]) => (
          <li
            key={letra}
            onClick={() => handleSeleccion(letra)}
            style={{
              cursor: 'pointer',
              padding: '10px',
              margin: '5px 0',
              backgroundColor:
                mostrarRespuesta && letra === pregunta.respuesta
                  ? '#2e7d32'
                  : letra === seleccionada
                  ? '#c62828'
                  : '#1e1e1e',
              borderRadius: '5px'
            }}
          >
            {letra}. {texto}
          </li>
        ))}
      </ul>

      <button onClick={copiarPreguntaAlPortapapeles} style={botonStyle}>
        📋 Copiar pregunta
      </button>

      {mensajeCopiado && (
        <p style={{ color: '#90ee90', marginTop: '10px' }}>{mensajeCopiado}</p>
      )}

      {mostrarRespuesta && (
        <button onClick={siguientePregunta} style={botonStyle}>
          Siguiente pregunta
        </button>
      )}
    </div>
  );
}

export default App;
