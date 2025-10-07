import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json());


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RUTA_JSON = path.join(__dirname, 'tareas.json');



function guardarTareas() {
  fs.writeFileSync(RUTA_JSON, JSON.stringify(tareas, null, 2), 'utf8');
}

function cargarTareas() {
  try {
    if (fs.existsSync(RUTA_JSON)) {
      const data = fs.readFileSync(RUTA_JSON, 'utf8');
      return JSON.parse(data);
    } else {
      return [
        { nombre: "Aprender Javascript", descripcion: "Estudiar fundamentos y práctica diaria", estado: "PENDIENTE" },
        { nombre: "Aprender Música", descripcion: "Tomar clases de guitarra", estado: "COMPLETADA" }
      ];
    }
  } catch (err) {
    console.error("Error leyendo tareas.json:", err);
    return [];
  }
}


let tareas = cargarTareas();


app.post('/tareas', (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre || !descripcion) {
    return res.status(400).json({ mensaje: "Debe incluir nombre y descripcion" });
  }

  const existe = tareas.find(t => t.nombre.toLowerCase() === nombre.toLowerCase());
  if (existe) {
    return res.status(400).json({ mensaje: "Ya existe una tarea con ese nombre" });
  }

  const nueva = { nombre, descripcion, estado: "PENDIENTE" };
  tareas.push(nueva);
  guardarTareas(); 

  res.status(201).json({ mensaje: "Tarea creada correctamente", tarea: nueva });
});



app.get('/tareas', (req, res) => {
  res.json(tareas);
});



app.get('/tareas/:nombre', (req, res) => {
  const { nombre } = req.params;
  const tarea = tareas.find(t => t.nombre.toLowerCase() === nombre.toLowerCase());
  if (!tarea) return res.status(404).json({ mensaje: "Tarea no encontrada" });
  res.json(tarea);
});



app.put('/tareas/:nombre', (req, res) => {
  const { nombre } = req.params;
  const { nuevaDescripcion, nuevoNombre, estado } = req.body;

  const tarea = tareas.find(t => t.nombre.toLowerCase() === nombre.toLowerCase());
  if (!tarea) return res.status(404).json({ mensaje: "Tarea no encontrada" });

  if (nuevoNombre) {
    const duplicada = tareas.find(t => t.nombre.toLowerCase() === nuevoNombre.toLowerCase() && t !== tarea);
    if (duplicada) {
      return res.status(400).json({ mensaje: "Ya existe otra tarea con ese nombre" });
    }
    tarea.nombre = nuevoNombre;
  }

  if (nuevaDescripcion) tarea.descripcion = nuevaDescripcion;
  if (estado) tarea.estado = estado;

  guardarTareas(); 

  res.json({ mensaje: "Tarea actualizada", tarea });
});


app.patch('/tareas/:nombre/estado', (req, res) => {
  const { nombre } = req.params;
  const { estado } = req.body;

  if (!estado) return res.status(400).json({ mensaje: "Debe enviar el nuevo estado" });

  const tarea = tareas.find(t => t.nombre.toLowerCase() === nombre.toLowerCase());
  if (!tarea) return res.status(404).json({ mensaje: "Tarea no encontrada" });

  tarea.estado = estado;
  guardarTareas(); 

  res.json({ mensaje: "Estado actualizado correctamente", tarea });
});


app.get('/tareas/estado/:estado', (req, res) => {
  const { estado } = req.params;
  const filtradas = tareas.filter(t => t.estado.toLowerCase() === estado.toLowerCase());
  if (filtradas.length === 0) {
    return res.status(404).json({ mensaje: "No hay tareas con ese estado" });
  }
  res.json(filtradas);
});


app.delete('/tareas/:nombre', (req, res) => {
  const { nombre } = req.params;
  const index = tareas.findIndex(t => t.nombre.toLowerCase() === nombre.toLowerCase());
  if (index === -1) return res.status(404).json({ mensaje: "Tarea no encontrada" });

  const eliminada = tareas.splice(index, 1)[0];
  guardarTareas(); // 👈 Guardar cambios en el JSON

  res.json({ mensaje: "Tarea eliminada correctamente", tarea: eliminada });
});


app.listen(3000, () => {
  console.log("✅ Servidor escuchando en el puerto 3000");
});

